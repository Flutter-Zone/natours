const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
}



exports.updateMe = catchAsync(async (req, res, next) => {
    // 1. Create error if user Post password data
    if(req.body.password || req.body.confirmPassword){
        return next(new AppError('This route is not for password updates. Plese use /updateMyPassword'), 400);
    }

    // 3. Filter out unwanted fields
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 2. Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new: true, runValidators: true});


    res.status(201).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    // 1. Create error if user Post password data
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.createUser = (req, res) => {
    // 500 means internal server error
    res.status(500).json({
        status: 'error',
        message: 'This route is not implemented! Please use sign up instead'
    });
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Do not update passwords with this
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);