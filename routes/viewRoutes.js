const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const router = express.Router();


// VIEW ROUTES
// router.get('/', (req, res) => {
//     res.status(200).render('base', {
//         tour: 'The Forest Hiker',
//         user: 'Blankson'
//     });
// });


router.get('/', viewController.getOverview);
router.get('/tours/:slug', authController.protect, viewController.getTour);
router.get('/login', viewController.getLoginForm);
  

module.exports = router;