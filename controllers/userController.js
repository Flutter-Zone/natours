const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

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