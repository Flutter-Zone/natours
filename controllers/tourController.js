const AppError = require('../utils/appError');
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


exports.getToursWithin = catchAsync( async (req, res, next) => {
    // using destruction to get the values from the query params
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    // converting distance to radian
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng){
        return next(new AppError('Please provide latitude and longitude in the format lat,lngl', 400));
    }

    const tours = await Tour.find({ 
        startLocation: { 
            $geoWithin: { $centerSphere: [[lng, lat], radius] }
        } 
        });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
}); 


exports.getDistances = catchAsync( async (req, res, next) => {
    // using destruction to get the values from the query params
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng){
        return next(new AppError('Please provide latitude and longitude in the format lat,lngl', 400));
    }

    const  distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier // similar to dividing by 1000
            }
        },
        {
            $project: {
                distance: 1,
                name: 1,
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
}); 
