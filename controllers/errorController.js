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
    console.log("this is called imm");
    const errors = Object.values(error.errors).map(e => e.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
}

const sendErrorProd = (err, res) => {
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
          });
    }
    // Programming or other unknown error: don't leak error details
    else {
        // 1 log error
        console.error('ERROR', err);
        
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
          });
    }
    
}


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if(process.env.NODE_ENV == 'development'){
        sendErrorDev(err, res);
    }else if(process.env.NODE_ENV == 'production'){
        let error = {...err};
        if(error.kind === 'ObjectId') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error._message) error = handleValidationErrorDB(error);
        
        sendErrorProd(error, res);
    }
  }