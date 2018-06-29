var mongoose = require('mongoose');

var AnnouncementSchema = mongoose.Schema({
    authorId: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    schedule: {
        type: Date,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: true,
    }
});

var announcement = mongoose.model('Announcement', AnnouncementSchema);
module.exports = announcement;