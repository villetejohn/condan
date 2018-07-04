var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport')
var bodyParser = require('body-parser');
var { check, validationResult } = require('express-validator/check');
var User = require('../models/user');

// Route:  /user/register
// GET Request
router.get('/register', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard/home')
  } else {
    res.render('user/register');
  }
});

// Route: /user/register
// POST Request
router.post('/register', [
  check('name').not().isEmpty().withMessage('Please enter your name'),
  check('type').not().isEmpty().withMessage('Please select whether owner or tenant'),
  check('unit').not().isEmpty().withMessage('Please enter your unit number'),
  check('email').not().isEmpty().withMessage('Please enter your email'),
  check('email').isEmail().withMessage('Please enter a valid email'),
  check('email').custom(async function(value) {
    var user = await User.find({'email': value});
    return user.length == 0;
  }).withMessage('E-mail is already in use'),
  check('username').not().isEmpty().withMessage('Please enter your username'),
  check('username').custom(async function(value) {
    var username = await User.find({'username': value});
    return username.length == 0;
  }).withMessage('Username already in use'),
  check('password').not().isEmpty().withMessage('Please enter your password'),
  check('password2').not().isEmpty().custom(async (value, {req}) => {
    if (value!== req.body.password) {
      throw new Error('Password did not match');
    }
  })
], function(req, res, next) {
  const name = req.body.name;
  const type = req.body.type;
  const unit = req.body.unit;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('user/register', {  
      errors: errors.array(),
      formDetails: {
        name: name,
        type: type,
        unit: unit,
        email: email,
        username: username,
      }
    });
    return;
    
  } else {
    var newUser = new User( {
      name: name,
      type: type,
      unit: unit,
      email: email,
      username: username,
      password: password
    });
  
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
        (err) ? console.log(err) : '';
  
        newUser.password = hash;
        newUser.save(function(err) {
          if(err) {
            console.log(err);
            return;
          } else {
            // res.flash('success', 'You are now registered and can log in');
            res.redirect('/');
            console.log('save!');
          }
        });
      });
    });
  }

});

// Route: /user/login
router.get('/login', function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard/home')
  } else {
    res.render('user/login');
  }
});

// Route: /user/login
// POST Request
router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/dashboard/home',
    failureRedirect: '/user/login',
    failureFlash: true
  })(req, res, next);
});


// Route: /user/logout
// GET request
router.get('/logout', ensureAuthenticated, function(req, res, next) {
  req.logout();
  res.redirect('/user/login');
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
