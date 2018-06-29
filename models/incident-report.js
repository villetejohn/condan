var mongoose = require('mongoose');

var IncidentReportSchema = mongoose.Schema({
    authorId: {
        type: String,
        requried: true
    },
    author: {
        type: String,
        required: true
    },
    issue: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: false,
    },
    assignee: {
        type: String,
        required: false
    },
    status: {
        type: String,
        default: 'Pending',
        required: false
    }
});

var incidentReport = mongoose.model('IncidentReport', IncidentReportSchema);
module.exports = incidentReport;