const fs = require('fs');
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
    if(val > tours.length){
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid Id'
        });
    }
    next();
}

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
        results: tours.length,
        data: {
            tours
        }
    });
}

exports.getTour = (req,res) => {
    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id);
    res.status(200).json({
        status: 'success', 
        data: {
            tour
        }
    });
}

exports.createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const tour = Object.assign({id: newId}, req.body);

    tours.push(tour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'Success',
            data: {
                tour
            }
        })
    });
}

exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'sucess',
        data: {
            tour : '<Update tour here ...>'
        }
    })
}

exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'sucess',
        data: null
    });
}
