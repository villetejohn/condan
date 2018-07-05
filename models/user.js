var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        default: false,
        required: true,
    },
    is_validated: {
        type: Boolean,
        default: false,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: true
    }
});

var user = mongoose.model('User', UserSchema);
module.exports = user;