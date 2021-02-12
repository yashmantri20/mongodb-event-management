var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = new Schema({
    eventName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true
    },
    invitedUsers: []
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);