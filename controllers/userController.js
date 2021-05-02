const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
}

exports.getAllUsers = catchAsync(async(req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        requestedaAt: req.requestTime,
        results: users.length,
        data: {
            users
        }
    });
});

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


exports.getUser = (req, res) => {
    // 500 means internal server error
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet implemented'
    });
}

exports.createUser = (req, res) => {
    // 500 means internal server error
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet implemented'
    });
}

exports.deleteUser = (req, res) => {
    // 500 means internal server error
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet implemented'
    });
}

exports.updateUser = (req, res) => {
    // 500 means internal server error
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet implemented'
    });
}