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
router.get('/', ensureAuthenticated, function(req, res, next) {
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
router.get('/home', ensureAuthenticated, function(req, res, next) {
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
													return moment(announcement.schedule).format("dddd, MMMM Do, h:mma");
												});
                        var announceDatesPretty = announcements.map(function(announcement) {
                            return moment(announcement.schedule).toNow(true);
												});
												
                        res.render('dashboard/home', {
                            incidents: incidents,
                            incidentDates: incidentDates,
														announcements: announcements,
														announceDates: announceDates,
                            announceDatesPretty: announceDatesPretty
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
router.get('/incident-report', ensureAuthenticated, function(req, res, next) {
    // Load incidents reports created by user
    Incident.find({'authorId': req.user._id}, null, {sort: 'created_at'}, function(err, incidents) {
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
router.get('/view-reports', ensureAuthenticated, function(req, res, next) {
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
router.get('/generate-reports', ensureAuthenticated, function(req, res, next) {
    res.render('dashboard/generate-report');
});

// Route: dashboard/announcements
// GET Request
router.get('/announcement', ensureAuthenticated, function(req, res, next) {
		if (req.query.id) {
			var annceId = req.query.id;
			Announcement.findById(annceId, function(err, announcement) {
				if(err) {
					console.log(err)
				} else {
					res.render('dashboard/announcement', {
						isEditMode: true,
						formDetails: announcement,
						isoDate: moment(announcement.schedule).format('YYYY-MM-DDTHH:mm'),
						minDate: moment().format('YYYY-MM-DDTHH:mm'),
						announceId: announcement._id,
					});
				}
			})
		} else {
			res.render('dashboard/announcement', {
				minDate: moment().format('YYYY-MM-DDTHH:mm')
			});
		}
});

// Route: dashboard/announcements/edit/:id
// GET Request
router.get('/announcement/delete/:id', function(req, res) {
	Announcement.remove({'_id': req.params.id}, function(err) {
		if(err) {
			console.log(err);
		}
	})
	res.redirect('/dashboard/home');
});

// Route: dashboard/announcements
// POST Request
router.post('/announcement', [
	check('title').not().isEmpty().withMessage('Please indicate title'),
	check('title').isLength({max: 160}).withMessage('Title can only be 160 characters'),
	check('content').not().isEmpty().withMessage('Please indicate content'),
	check('content').isLength({max: 2000}).withMessage('Details can only be 2200 characters'),
	check('schedule').not().isEmpty().withMessage('Please indicate schedule'),
	check('schedule').custom(async function(value) {
		var announceDate = moment(value);
		// announcement sched - date now
		var dateDiff = announceDate.diff(moment());
		// dateDiff <= 0 ? false : '';
		if (dateDiff <= 0) {
			return false;
		}

	}).withMessage('Please enter a valid schedule')
], function(req, res, next) {
    const authorId = req.body.authorId;
    const author = req.body.author;
    const schedule = req.body.schedule;
    const title = req.body.title;
	const content = req.body.content;
		
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
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
				errors: errors.array(),
				minDate: moment().format('YYYY-MM-DDTHH:mm')
			});

		} else {

			if (req.body.isEditMode) {
				Announcement.findByIdAndUpdate(req.body.announceId, {$set: {
					schedule: schedule,
					title: title,
					content: content
				}}, function(err, status) {
					if(err) {
						console.log(err);
					} else {
						res.redirect('/dashboard/home');
					}

				});
				return;
			}

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
router.get('/amenities', ensureAuthenticated, function(req, res ,next) {
    res.render('dashboard/amenities');
});

// Route: dashboard/booked-amenities
// GET Request
router.get('/booked-amenities', ensureAuthenticated, function(req, res, next) {
	var query, sort;
	if (req.user.is_admin) {
		query = {
			status: 'Pending'
		};
	} else {
		query = {
			bookedById: req.user._id,
			status: 'Pending'
		};
	}

	BookedAmenity.find(query, null, {sort: '-created_at'}, function(err, bookedAmenities) {
		if(err) {
				console.log(err);
		} else {
				var bookedStartDates = bookedAmenities.map(function(bookedAmenity) {
					return moment(bookedAmenity.scheduleStart);
				});
				var bookedEndDates = bookedAmenities.map(function(bookedAmenity) {
					return moment(bookedAmenity.scheduleStart);
				});

				res.render('dashboard/book-amenities', {
					bookedAmenities: bookedAmenities,
					bookedStartDates: bookedStartDates,
					bookedEndDates: bookedEndDates,
					minDate: moment().format('YYYY-MM-DDTHH:mm')
				});
		}
	});
});

// Route: dashboard/booked-amenities
// POST Request
router.post('/booked-amenities', [
	check('amenity').not().isEmpty().withMessage('Please select amenity'),
	check('scheduleStart').not().isEmpty().withMessage('Please select schedule'),
	check('scheduleEnd').not().isEmpty().withMessage('Please indicate your booking duration'),
	check('scheduleStart').isISO8601().withMessage('Please enter a valid schedule'),
	check('scheduleEnd').isISO8601().withMessage('Please enter a valid schedule'),
	check('scheduleStart').custom(async function(value) {
		var bookingSchedStart = moment(value);
		var dateDiff = bookingSchedStart.diff(moment());
		if (dateDiff <= 0) {
			return false;
		}

	}).withMessage('Please enter a valid schedule'),
	check('scheduleEnd').custom(async function(value, {req}) {
		var bookStartDate = moment(req.body.scheduleStart);
		var bookEndDate = moment(value);

		var dateDiff = bookEndDate.diff(bookStartDate);
		if (dateDiff <= 0) {
			return false;
		}

	}).withMessage('Please select valid booking duration'),
	check('scheduleEnd').custom(async function(value, {req}) {
		var bookStartDate = moment(req.body.scheduleStart);
		var bookEndDate = moment(value);

		var dateDiff = bookEndDate.diff(bookStartDate);
		// if booking duration is not longer than 15mins or 900000ms
		if (dateDiff < 900000) {
			return false;
		}

	}).withMessage('Please select longer booking duration'),
],function(req, res, next) {
	const amenity = req.body.amenity;
	const bookedById = req.body.bookedById;
	const bookedByName = req.body.bookedByName;
	const scheduleStart = req.body.scheduleStart;
	const scheduleEnd = req.body.scheduleEnd;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		var query;
		if (req.user.is_admin) {
			query = {
				status: 'Pending'
			};
		} else {
			query = {
				bookedById: req.user._id,
				status: 'Pending'
			};
		}
		BookedAmenity.find(query, null, {sort: '-created_at'}, function(err, bookedAmenities) {
			if(err) {
					console.log(err);
			} else {
					var bookedStartDates = bookedAmenities.map(function(bookedAmenity) {
						return moment(bookedAmenity.scheduleStart);
					});
					var bookedEndDates = bookedAmenities.map(function(bookedAmenity) {
						return moment(bookedAmenity.scheduleStart);
					});

					res.render('dashboard/book-amenities', {
						bookedAmenities: bookedAmenities,
						bookedStartDates: bookedStartDates,
						bookedEndDates: bookedEndDates,
						minDate: moment().format('YYYY-MM-DDTHH:mm'),
						user: {
							name: bookedByName,
							_id: bookedById,
							is_admin: req.user.is_admin
						},
						formDetails: {
							amenity: amenity,
							scheduleStart: scheduleStart,
							scheduleEnd: scheduleEnd,
						},
						errors: errors.array()
					});
			}
		});


	} else {
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
	}
});

// Route: dashboard/accounts
// GET Request
router.get('/accounts', ensureAuthenticated, function(req, res, next) {
	User.find({}, function(err, users) {
		if (err) {
			console.log(err);
		} else {
			res.render('dashboard/accounts', {
				users: users
			});
		}
	});
});

// Route: dashboard/accounts/activate/:id
// GET Request
router.get('/accounts/activate/:id', function(req, res, next) {
	if (req.user.is_admin) {
		User.findByIdAndUpdate(req.params.id, {$set: {is_validated: 'true'}}, function(err, status) {
			if(err) {
				console.log(err);
			} else {
				res.redirect('/dashboard/accounts');
			}
		});
	} else {
		res.redirect('/dashboard/home');
	}
});


// Route: dashboard/pending-bookings
// GET Request
router.get('/pending-bookings', ensureAuthenticated, function(req, res, next){
	res.send('Pending Bookings');
});

// Route: /dashbaord/pending-bookings
// POST Request
router.post('/pending-bookings', function(req, res, next) {
	if (req.user.is_admin) {
		BookedAmenity.findByIdAndUpdate(req.body.bookingId, {$set: {status: 'Approved'}}, function(err) {
			if(err) {
				console.log(err);
			} else {
				res.redirect('/dashboard/booked-amenities');
			}
		});
	}
});

// Check using Passport if authenticated
function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/user/login');
	}
}


module.exports = router;