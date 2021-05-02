const crypto = require('crypto');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const SendEmail = require('../utils/email');
const sendEmail = require('../utils/email');

const signToken = id =>{
    return jwt.sign({id: id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
}

exports.signup = catchAsync(async (req, res, next) => {

    let user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        role: req.body.role,
    });

    const token = signToken(user._id);

    console.log("the token after signing up", token);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
});

exports.login = catchAsync(async(req, res, next) => {
    const {email, password} = req.body;

    // 1, Check if email and password was provided
    if(!email || !password){
        return next(new AppError('Please provide email and password'), 400);
    }

    // 2. Check if user exists && password is correct
    const user = await User.findOne({email}).select('+password'); // note that fields that are not selected by default must have + infront of them to be selected

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user._id);
    
    res.status(200).json({
        status: 'success',
        token
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1. Getting token and check if it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2. Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    console.log('the decoded: ', decoded);

    // 3. Check if user still exists
    const user = await User.findById(decoded.id);

    if(!user){
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // 4. Check if user changed password after the JWT was issued
   if(user.changedPasswordAfter(decoded.iat)){
       return next(new AppError('User recently changed password! Please sign in again.', 401));
   }

    // Grant Access to protected route
    req.user = user;
    next();
});


// ...roles represents the arguments that will be passed to the restrictTo function.
// it will come in as an array
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // include is used to find if an element exist in an array
        // we can use the user on the request which is coming from the protect middleware
        // this is because the protect middleware runs before the restrictTo middleware
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action.', 403));
        }

        next();
    }
}

exports.forgotPassword = catchAsync( async(req, res, next) => {
    // 1. Get user based on posted email
    const user = await User.findOne({ email: req.body.email });

    if(!user){
        return next(new AppError('There is no user with this email address', 404));
    }

    // 2. Generate the random reset token
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    // 3 Send it to the user's email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;

    const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm  to ${resetUrl}. \nIf you didn't forget your password, please ignore this email`;

    try{
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 mins)',
            message
        });
    
        res.status(200).json({
            status: 'success',
            message: 'Toke sent to email'
        });
    } catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!'));
    }
});

exports.resetPassword = catchAsync( async (req, res, next) => {
    // 1. get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // note that the token is the only thing we can use to query the user, because we do not have any other info
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    // 2. if token has not expired and there is a user, set the new password
    if(!user){
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3. update passwordChangedAt property for the user
    // 4. Log the user in, send JWT
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    });
});