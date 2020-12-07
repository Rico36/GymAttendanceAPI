
const express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    connectEnsureLogin = require('connect-ensure-login'),
    flash = require('connect-flash'),
    gravatar = require('gravatar'),  
    debug = require('debug')('users');


// Menu options
//
// router.get("/dropZone", function (req, res) {
//   debug("GET dropZone!!!");
//   res.render("dropZone");
// })

// router.get("/reports", function (req, res) {
//   res.render("reports");
// })

router.get("/membersGrid",  connectEnsureLogin.ensureLoggedIn(), function (req, res) {
  debug("/membersGrid");
  res.render("membersGrid");
})

router.get("/devicesGrid", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
  debug("/devicesGrid");
  res.render("devicesGrid");
})

router.get("/roomsGrid", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
  debug("/roomsGrid");
  res.render("roomsGrid");
})


router.get("/checkinsGrid",  connectEnsureLogin.ensureLoggedIn(), function (req, res) {
  debug("/checkinsGrid");
  res.render("checkinsGrid");
})



/* PASSPORT SETUP  */
/* ROUTES */

/*
Resetting or changing passwords :

You can reset or change passwords using 2 simple functions in passport-local-mongoose. 
They are setPassword function and changePassword functions. Normally setPassword is used when the user forgot 
the password and changePassword is used when the user wants to change the password.

for setPassword code is

// user is your result from userschema using mongoose id
 user.setPassword(req.body.password, function(err, user){ ..

For changePassword
// user is your result from userschema using mongoose id
  user.changePassword(req.body.oldpassword, req.body.newpassword, function(err) .


  
/* router.get('/forgot', function (req, res) {
  if (req.isAuthenticated()) {
      //user is alreay logged in
      return res.redirect('/');
  }

  //UI with one input for email
  res.render('forgot');
});

router.post('/forgot', function (req, res) {
  if (req.isAuthenticated()) {
      //user is alreay logged in
      return res.redirect('/');
  }
  users.forgot(req, res, function (err) {
      if (err) {
          req.flash('error', err);
      }
      else {
          req.flash('success', 'Please check your email for further instructions.');
      }
      res.redirect('/');
  });
});

router.get('/reset/:token', function (req, res) {
  if (req.isAuthenticated()) {
      //user is alreay logged in
      return res.redirect('/');
  }
  var token = req.params.token;
  users.checkReset(token, req, res, function (err, data) {
      if (err)
          req.flash('error', err);

      //show the UI with new password entry
      res.render('reset');
  });
});

router.post('/reset', function (req, res) {
  if (req.isAuthenticated()) {
      //user is alreay logged in
      return res.redirect('/');
  }
  users.reset(req, res, function (err) {
      if (err) {
          req.flash('error', err);
          return res.redirect('/reset');
      }
      else {
          req.flash('success', 'Password successfully reset.  Please login using new password.');
          return res.redirect('/login');
      }
  });
});
 */

// This is the default web page.  It is intercepted by connectEnsureLogin 
// and if the user has not authenticated yet, it will redirect to /login

router.get('/',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.render('index', {title: 'Express from server folder', user : req.user})
);

// router.get('/', function(req, res, next) { 
//   res.render('index', { title: 'Express from server folder' }); 
// });

  /* GET login page. */ 
  router.get('/login', function(req, res, next) { 
       res.render('login', { title: 'Login Page', message: req.flash('loginMessage') }); 
  }); 

  /* POST login */ 
  router.post('/login', passport.authenticate('local-login', { 
      //Success go to Profile Page / Fail go to login page 
      successRedirect : '/profile', 
      failureRedirect : '/login', 
      failureFlash : true 
  })); 

  /* GET Profile page. */ 
  router.get('/profile', isLoggedIn, function(req, res, next) { 
      res.render('profile', { title: 'Profile Page', user : req.user,
        avatar: gravatar.url(req.user.email ,  {s: '100', r: 'x',
          d:'retro'}, true) }); 
  }); 

 /* GET Signup */ 
 router.get('/signup', function(req, res) { 
    res.render('signup', { title: 'Signup Page', 
      message:req.flash('signupMessage') }); 
  }); 
  
  /* POST Signup */ 
  router.post('/signup', passport.authenticate('local-signup', { 
    //Success go to Profile Page / Fail go to Signup page 
    successRedirect : '/profile',       
    failureRedirect : '/signup', 
    failureFlash : true 
  })); 


  /* GET Profile page. */ 
  router.get('/profile',  function(req, res, next) {
  res.render('profile', { title: 'Profile Page', user : req.user, avatar: gravatar.url(req.user.email ,  
                              {s: '100', r: 'x', d: 'retro'}, true) });
   }); 

  /* check if user is logged in */ 
  function isLoggedIn(req, res, next) { 
    if (req.isAuthenticated()) 
        return next(); 
    res.redirect('/login'); 
  } 

  /* GET Logout Page */ 
  router.get('/logout', function(req, res) { 
    req.logout(); 
    res.redirect('/'); 
  }); 



module.exports = router;
