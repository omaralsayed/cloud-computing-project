const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const validator = require('password-validator');

const User = require('../models/user');
const { forwardAuthenticated } = require('../config/auth');

router.get('/register', forwardAuthenticated, (req, res) => 
  res.render('register', { user: req.user })
);

const schema = new validator();
schema
.is().min(6)      

router.post('/register', (req, res) => {
  let errors = [];
  const { name, first, last, email, password, repeatedPassword } = req.body;
  if (!name || !first || !last || !email || !password || !repeatedPassword) {
    errors.push({ msg: 'Please fill out all fields' });
  } else {
    if (password != repeatedPassword) {
      errors.push({ msg: 'Passwords do not match' });
    } else {
      const validationErrors = schema.validate(password, { list: true });
      if (validationErrors.length) {
        for (let errorIdx = 0; errorIdx < validationErrors.length; errorIdx++) {
          if (validationErrors[errorIdx] == 'min') {
            errors.push({ msg: 'Password must be at least 6 characters' });
          }
        }
      }
    }
  }
  if (errors.length) {
    res.render('register', { 
      errors, name, first, last, email, password, repeatedPassword, user: req.user
    });
  } else {
    User.findOne({ email: { "$regex": "^" + email + "\\b", "$options": "i" }})
    .then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', { 
          errors, name, first, last, email, password, repeatedPassword, user: req.user
        });
      } else {
        const newUser = new User({ name, first, last, email, password });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => {
                req.flash('success', 'You are now registered and can log in!');
                res.redirect('/');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
});

module.exports = router;