const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// creating an instance of the express
const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// creating our own middleware
app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});

const addDateToRequestObject = (req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
};

app.use(addDateToRequestObject);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
