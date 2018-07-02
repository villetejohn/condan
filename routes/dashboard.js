var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var moment = require('moment');
var User = require('../models/user');
var Incident = require('../models/incident-report');
var Announcement = require('../models/announcement');
var BookedAmenity = require('../models/booked-amenities');
var { check, validationResult } = require('express-validator/check');


// Route: dashboard/
// GET Request
router.get('/', function(req, res, next) {
    if (req.user){
        // req.session.sessionFlash = {
        //     type: 'success',
        //     message: 'This is a flash message using custom middleware and express-session.'
        // }
        res.redirect('dashboard/home');
    }
    else
        res.redirect('/');
});

// Route: dashboard/home
// GET Request
router.get('/home', function(req, res, next) {
    if (req.user) {

        //Load Announcements
        Announcement.find({}, null, {sort: 'schedule'}, function(err, announcements) {
            if(err) {
                console.log(err);
            } else {
                // Load incidents reports created by user
                Incident.find({'authorId': req.user._id}, null, {sort: '-created_at'}, function(err, incidents) {
                    if(err) {
                        console.log(err);
                    } else {
                        var incidentDates = incidents.map(function(incident) {
                            return moment(incident.created_at).fromNow();
                        });
                        var announceDates = announcements.map(function(announcement) {
                            return moment(announcement.schedule).toNow(true);
                        });
                        res.render('dashboard/home', {
                            incidents: incidents,
                            incidentDates: incidentDates,
                            announcements: announcements,
                            announceDates: announceDates
                        });
                    }
                });
            }
        });


    }
    else
        res.redirect('/');
});

// Route: dashboard/incident-report
// GET Request
router.get('/incident-report', function(req, res, next) {
    // Load incidents reports created by user
    Incident.find({'authorId': req.user._id}, null, {sort: '-created_at'}, function(err, incidents) {
        if(err) {
            console.log(err);
        } else {
            var incidentDates = incidents.map(function(incident) {
                return moment(incident.created_at).fromNow();
						});
            res.render('dashboard/incident-report', {
                incidents: incidents,
                incidentDates: incidentDates,
            });
        }
    });
});

// Route: dashboard/incident-report
// POST Request
router.post('/incident-report', [
		check('issue').not().isEmpty().withMessage('Please indicate the issue'),
		check('location').not().isEmpty().withMessage('Please indicate the location')
], function(req, res, next) {
	const authorId = req.body.authorId;
	const author = req.body.author;
	const issue = req.body.issue;
	const location = req.body.location;
					
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		Incident.find({'authorId': req.user._id}, null, {sort: '-created_at'}, function(err, incidents) {
				if(err) {
						console.log(err);
				} else {
						var incidentDates = incidents.map(function(incident) {
								return moment(incident.created_at).fromNow();
						});
						console.log(formDetails);
						res.render('dashboard/incident-report', {
								incidents: incidents,
								incidentDates: incidentDates,
								user: {
									name: author,
									_id: authorId
								},
								formDetails: {
									location: location,
									issue: issue
								},
								errors: errors.array()
						});
				}
		});
	} else {
		var newIncident = new Incident( {
				authorId: authorId,
				author: author,
				issue: issue,
				location: location,
		});

		newIncident.save(function(err) {
				if(err) {
						console.log(err);
						return;
				} else {
						
						res.redirect('/dashboard/incident-report');
				}
		});
		
	}

});

// Route: dashboard/view-reports
// GET Request
router.get('/view-reports', function(req, res, next) {
    Incident.find({}, function(err, incidents) {
        if(err) {
            console.log(err);
        } else {
            res.render('dashboard/view-report', {
                incidents: incidents,
            });
        }   
    });
    
});

// Route: dashboard/view-reports
// POST Request
router.post('/view-reports', function(req, res, next) {
    var query;
    switch (req.body.status) {
        case 'Pending':
            query = {status: 'Reviewed'};
            break;
        case 'Reviewed':
            query = {status: 'Taking Action'};
            break;
        case 'Taking Action':
            query = {status: 'Resolved'}
            break;
        default:
            query = {status: 'Pending'};
            break;
    }

    Incident.findByIdAndUpdate(req.body.incidentId, {$set: query}, function(err, status) {
        if(err) {
            console.log(err);
        } else {
            res.redirect('/dashboard/view-reports');
        }
    });
});

// Route: dashboard/generate-reports
// 
router.get('/generate-reports', function(req, res, next) {
    res.render('dashboard/generate-report');
});

// Route: dashbaord/announcements
// GET Request
router.get('/announcement', function(req, res) {
    res.render('dashboard/announcement');
});

// Route: dashboard/announcements
// POST Request
router.post('/announcement', [
	check('title').not().isEmpty().withMessage('Please indicate title'),
	check('content').not().isEmpty().withMessage('Please indicate content'),
	check('schedule').not().isEmpty().withMessage('Please indicate schedule'),
	check('schedule').custom(async function(value) {

	})
], function(req, res, next) {
    const authorId = req.body.authorId;
    const author = req.body.author;
    const schedule = req.body.schedule;
    const title = req.body.title;
		const content = req.body.content;
		
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			var formDetails = {
				schedule: schedule,
				title: title,
				content: content};
				console.log(formDetails);

			res.render('dashboard/announcement', {
				user: {
					name: author,
					_id: authorId
				},
				formDetails: {
					schedule: schedule,
					title: title,
					content: content
				},
				errors: errors.array()
			});

		} else {
			var newAnnouncement = new Announcement( {
					authorId: authorId,
					author: author,
					schedule: schedule,
					title: title,
					content: content
			});
	
			newAnnouncement.save(function(err) {
					if(err) {
							console.log(err);
							return;
					} else {
							res.redirect('/dashboard/announcement');
							console.log('Announcement Added');
					}
			});
		}
});

//Route: dashboard/aminities
// GET Request
router.get('/amenities', function(req, res ,next) {
    res.render('dashboard/amenities');
});

// Route: dashboard/booked-amenities
// GET Request
router.get('/booked-amenities', function(req, res, next) {
    res.render('dashboard/book-amenities');
});

// Route: dashboard/booked-amenities
// POST Request
router.post('/booked-amenities', function(req, res, next) {
    const amenity = req.body.amenity;
    const bookedById = req.body.bookedById;
    const bookedByName = req.body.bookedByName;
    const scheduleStart = req.body.scheduleStart;
    const scheduleEnd = req.body.scheduleEnd;

    var newBookedAmenity = new BookedAmenity( {
        amenity: amenity,
        bookedById: bookedById,
        bookedByName: bookedByName,
        scheduleStart: scheduleStart,
        scheduleEnd: scheduleEnd
    });

    newBookedAmenity.save(function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log('Amenity Booked');
            res.redirect('/dashboard/booked-amenities');
        }
    });
});

module.exports = router;