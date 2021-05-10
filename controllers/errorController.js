const AppError = require('./../utils/appError');

const handleCastErrorDB = error => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 404);
}

const handleDuplicateFieldsDB = error => {
    const value = error.keyValue.name;
    const message = `Duplicate field value: "${value}". Please use another value`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = error =>{
    const errors = Object.values(error.errors).map(e => e.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, req, res) => {
    // API
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
          });
    }

    // RENDERED WEBSITE
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
    });
}

const sendErrorProd = (err, req, res) => {
    // APIS
    if(req.originalUrl.startsWith('/api')){
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }

        // Programming or other unknown error: don't leak error details
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        });
        
    }

    if(err.isOperational){
        // RENDERED WEBSITE
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message,
        });
    }

    // Programming or other unknown error: don't leak error details
    // RENDERED WEBSITE
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later.',
    });
}

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleTokenExpiredError = () => new AppError('Your token has expired!. Please log in again', 401);

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if(process.env.NODE_ENV == 'development'){
        sendErrorDev(err,req, res);
    }else if(process.env.NODE_ENV == 'production'){
        let error = {...err};
        error.message = err.message;
        if(error.kind === 'ObjectId') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error._message) error = handleValidationErrorDB(error);
        if(error.name === "JsonWebTokenError") error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleTokenExpiredError();

        sendErrorProd(error, req, res);
    }
  }