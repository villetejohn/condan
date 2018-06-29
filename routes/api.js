var express = require('express');
var router = express.Router();
var Amenity = require('../models/booked-amenities');
var moment = require('moment');

//Router: api/booked-amenities
// GET API Request
router.get('/booked-amenities', function(req, res, next) {
  Amenity.find({}, null, {sort: 'scheduleStart'}, function(err, bookingDetails) {
    var newBookingDetails = bookingDetails.map(bookDetail => {
      return {
        title: `${bookDetail.bookedByName} | ${bookDetail.amenity}`,
        start: bookDetail.scheduleStart,
        end: moment(bookDetail.scheduleEnd)
      }  
    });

    res.json({bookingDetails: newBookingDetails});
  });
});

module.exports = router;