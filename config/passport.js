var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var config = require('../config/database');
var bcrypt = require('bcryptjs');

module.exports = function(passport) {
    passport.use(new LocalStrategy({
            session: true,
        },
        function(username, password, done) {
            //Match Username
            User.findOne({username: username, is_validated: true}, function(err, user) {
                if (err) throw err;
                if (!user) {
                    return done(null, false, { message: 'Username and password did not match' });
                }
                
                //Match Password
                bcrypt.compare(password, user.password, function(err, isMatch){
                    if(err) throw err;
                    if(isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Username and password did not match'});
                    }
                });
            });
        }   
    )); 

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


};