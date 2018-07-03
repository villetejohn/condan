var express = require('express');
var router = express.Router();
var Amenity = require('../models/booked-amenities');
var moment = require('moment');

//Router: api/booked-amenities
// GET API Request
router.get('/booked-amenities', function(req, res, next) {
  Amenity.find({status: 'Approved'}, null, {sort: 'scheduleStart'}, function(err, bookingDetails) {
    var newBookingDetails = bookingDetails.map(bookDetail => {
      var color;
      switch (bookDetail.amenity) {
        case 'Pool':
            color = '#007bff';
            break;
        case 'Karaoke Room':
            color = '#ffc107';
            break;
        case 'Gym':
            color = '#28a745';
            break;
        default:
             color = '#6c757d';
            break;
      }
      return {
        title: `${bookDetail.bookedByName} | ${bookDetail.amenity}`,
        start: bookDetail.scheduleStart,
        end: moment(bookDetail.scheduleEnd),
        color: color
      }  
    });

    res.json({bookingDetails: newBookingDetails});
  });
});

module.exports = router;