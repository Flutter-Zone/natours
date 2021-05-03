// const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');



exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);


exports.cheapTourMiddleware = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort ='-ratingsAverage,price';
    req.query.fields='name,pricing,ratingsAverage,summary,difficulty';
    next();
}

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
