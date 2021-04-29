const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.cheapTourMiddleware = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort ='-ratingsAverage,price';
    req.query.fields='name,pricing,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = catchAsync(async (req,res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter().sort().limitFields().paginate();

    const tours = await features.query;
    res.status(200).json({
        status: 'success',
        requestedaAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    });
});

exports.getTour = catchAsync(async (req,res, next) => {
    const tour = await Tour.findById(req.params.id);

    if(!tour){
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success', 
        data: {
            tour
        }
    });
});

exports.createTour = catchAsync(async(req, res, next) => {
    const document = await Tour.create(req.body);
    res.status(201).json({
        status: 'Success',
        data: {
            tour: document
        }
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!tour){
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        } 
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if(!tour){
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getTourStats = catchAsync(async(req,res,next)=>{
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty'},
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity'},
                avgRating: { $avg: '$ratingsAverage'},
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price'},
                maxPrice: { $max: '$price'},
            }
        },
        {
            $sort: { avgPrice: 1 } //1 means sort by ascending
        },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async(req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        }, 
        {
            $match: {
                startDates: { 
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group:{
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1},
                tours: { $push: '$name' } 
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0 // 0 means do not show the _id in the results, whiles 1 will show it
            }
        },
        {
            $sort: { numTourStarts: -1} // 1 for ascending and -1 for descending
        },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});
