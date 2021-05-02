const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: String,
    password:{
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [8, 'Password should be at least 8 characters'],
        select: false
    },
    confirmPassword:{
        type: String,
        required: [true, 'Confirm password is required'],
        validate: {
            // this only works on create and save!!!
            validator: function(el){
                return el === this.password;
            },
            message: "Passwords do not match"
        }
    },
    passwordChangedAt: Date
});


userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

// instance method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changeTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        console.log(changeTimestamp, JWTTimestamp);

        return JWTTimestamp < changeTimestamp;
    }

    return false;
}


const User = mongoose.model('User', userSchema);

module.exports = User;