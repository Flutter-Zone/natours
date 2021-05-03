const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema);

// query middleware
reviewSchema.post(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    });

    next();
});

module.exports = Review;