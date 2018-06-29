var mongoose = require('mongoose');

var AmenitySchema = mongoose.Schema({
  amenities: {
    type: Array,
    required: [String]
  },

});

var amenities = mongoose.model('amenitie', AmenitySchema);
module.exports = amenities;