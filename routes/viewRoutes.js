const express = require('express');
const viewController = require('./../controllers/viewController');

const router = express.Router();


// VIEW ROUTES
router.get('/', (req, res) => {
    res.status(200).render('base', {
        tour: 'The Forest Hiker',
        user: 'Blankson'
    });
});


router.get('/overview', viewController.getOverview);
router.get('/tour', viewController.getTour);
  

module.exports = router;