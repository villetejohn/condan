var mongoose = require('mongoose');

var BookedAmenitySchema = mongoose.Schema({
  amenity: {
    type: String,
    required: true
  },
  bookedById: {
    type: String,
    required: true
  },
  bookedByName: {
    type: String,
    required: true
  },
  scheduleStart: {
    type: Date,
    required: true
  },
  scheduleEnd: {
    type: Date,
    required: true
  }

});

var amenity = mongoose.model('bookedAmenitie', BookedAmenitySchema);
module.exports = amenity;
