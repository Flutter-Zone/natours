const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         // user-id-timestamp.jpeg
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     } 
// });

// saving image into memory as a buffer, in order to use in the sharp package
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')){
        cb(null, true);
    }else{
        cb(new AppError('Not an image! Please upload only images', 400), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
    if(!req.file) return next();

    req.file.filename =  `user-${req.user.id}-${Date.now()}.jpeg`;

    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/users/${req.file.filename}`);

    next();
}

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
    if(req.file) filteredBody.photo = req.file.filename;

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