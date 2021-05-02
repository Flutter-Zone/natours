const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id =>{
    return jwt.sign({id: id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
}

exports.signup = catchAsync(async (req, res, next) => {

    let user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        passwordChangedAt: req.body.passwordChangedAt,
    });

    const token = signToken;

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

