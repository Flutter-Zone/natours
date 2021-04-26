const Tour = require('./../models/tourModel');


exports.checkBody = (req, res, next) => {
    const body = req.body;
    if(!body.name || !body.price){
        // 400 means - bad request
        return res.status(400).json({
            status: "failure",
            message: "Missing name or price"
        });
    }
    next();
}

exports.getAllTours = (req,res) => {
    res.status(200).json({
        status: 'success',
        requestedaAt: req.requestTime,
        // results: tours.length,
        // data: {
        //     tours
        // }
    });
}

exports.getTour = (req,res) => {
    // const id = req.params.id * 1;
    // const tour = tours.find(el => el.id === id);
    res.status(200).json({
        status: 'success', 
        // data: {
        //     tour
        // }
    });
}

exports.createTour = (req, res) => {
    res.status(201).json({
        status: 'Success',
        data: {
            tour
        }
    });
}

exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        // data: {
        //     tour : '<Update tour here ...>'
        // }
    });
}

exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'sucess',
        data: null
    });
}
