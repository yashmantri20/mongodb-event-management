var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
    },
    resetPasswordToken: {
        type: String,
        default: "",
    },
    resetPasswordExpires: {
        type: String,
        default: "",
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);