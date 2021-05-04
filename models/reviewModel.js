const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
}, {
    // to allow virtual properties to show in json requests
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// query middleware
reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    });

    next();
});

// creating static methods for calculating the average ratings when the review is added on a tour
reviewSchema.statics.calculateAverageRatings = async function(tour){
    const stats = await this.aggregate([
        {
            $match: {tour: tour}
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    await Tour.findByIdAndUpdate(tour, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    });
};

// note that the post middleware function does not accept the next() as an argument
reviewSchema.post('save', function(){
    // this points to the current review
    // note that this.constructor points to Review
    // and this.tour points to the field on the reviewSchema
    this.constructor.calculateAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;