const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have more or equal than 10 characters'],
         
    },
    slug: String,
    rating: {
        type: Number,
        default: 4.5,
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size'],
    },
    difficulty: {
        type: String, 
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage:{
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            message: 'Discount price ($VALUE) should be below regular price',
            // this only points to current doc on NEW document creation
            validator: function(val){
                return val < this.price;
            }
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// defining virtual properties
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
});

// document middleware : runs before .save() and create() and not insertMany()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true});
    next();
});

// tourSchema.pre('save', function(next){
//     console.log('Will save document .....');
//     next();
// });

// tourSchema.post('save', function(doc, next){
//     console.log("the document returned: ", doc);
//     next();
// });


// QUERY MIDDLEWARE
// filtering secrets tours from the find()
//  /^find/ - this means that all query that starts with 'find' will
tourSchema.pre(/^find/, function(next){
    this.find({ secretTour: { $ne: true } });

    this.start = Date.now();
    next();
});

// tourSchema.post(/^find/, function(docs, next){
//     console.log(`Query took ${Date.now() - this.start} milliseconds!`);
//     console.log(docs);
//     next();
// });

// tourSchema.pre('findOne', function(next){
//     this.find({ secretTour: { $ne: true } });
//     next();
// });


// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next){
    // unshift method is to add element at the first position in an array
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;