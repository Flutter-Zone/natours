const { response } = require('../app');
const Tour = require('./../models/tourModel');



exports.getAllTours = async (req,res) => {

    try{
        // console.log("the request query", req.query);
        // const tours = await Tour.find({
        //     duration: 5,
        //     difficulty: 'easy',
        // });
        // BUILD QUERY
        // 1. Filtering
        const queryObj = {...req.query};
        const excludedFields = ['page', 'sort', 'limit', 'field'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 2. Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        console.log(JSON.parse(queryStr));

        let query = Tour.find(JSON.parse(queryStr));

        // 3. Sorting
        if(req.query.sort){
            // note that query.sort is from mongoose
            const sortBy = req.query.sort.split(',').join(' ');
            console.log(sortBy);
            query = query.sort(sortBy);
            // sort('price ratingsAverage')
        }else{
            query = query.sort('-createdAt');
        }

        // EXECUTE QUERY
        const tours = await query;

        // const tours = await Tour.find()
        // .where('duration').equals(5)
        // .where('difficulty').equals('easy');

        
        res.status(200).json({
            status: 'success',
            requestedaAt: req.requestTime,
            results: tours.length,
            data: {
                tours
            }
        });
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }

}

exports.getTour = async (req,res) => {
    try{
        // const id = req.params.id * 1;
        const tour = await Tour.findById(req.params.id);
        // Tour.findOne({ id: req.params.id })
        res.status(200).json({
            status: 'success', 
            data: {
                tour
            }
        });
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.createTour = async (req, res) => {
    // const newTour = new Tour();
    // newTour.save();

    try{
        const document = await Tour.create(req.body);
    
        res.status(201).json({
            status: 'Success',
            data: {
                tour: document
            }
        });
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.updateTour = async (req, res) => {
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: 'Invalid data sent'
        });
    }
}

exports.deleteTour = async (req, res) => {
    try{
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: 'Invalid data sent'
        });
    }
}
