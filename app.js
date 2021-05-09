const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize  = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');


// creating an instance of the express
const app = express();

// telling express what template engine we are using
app.set('view engine', 'pug');
// setting path to the views folder
app.set('views', path.join(__dirname, 'views'));

// 1) MIDDLEWARES

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// its better to place the helmet middleware before any other middleware
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit request from same IP
const limiter = rateLimit({
  // the number should be greate if you are building an api that will handle lots of requests
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, plese try again in an hour!'
});
app.use('/api', limiter);


// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb'}));

// Data sanitization against NoSQL from query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration', 
      'ratingsQuantity', 
      'ratingsAverage', 
      'maxGroupSize', 
      'difficulty',
      'price'
    ]
  })
);



// Test middleware : adding request time to the request object
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});


// API ROUTES
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error middleware
app.use(globalErrorHandler);

module.exports = app;
 