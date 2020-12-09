      var passwordValidator = require('password-validator');
      // Create a schema
      var schema = new passwordValidator();
      
      // Add properties to it
      schema
      .is().min(8)                                    // Minimum length 8
      .is().max(16)                                  // Maximum length 16
      .has().uppercase()                              // Must have uppercase letters
      .has().lowercase()                              // Must have lowercase letters
      .has().digits(1)                                // Must have at least 1 digits
      .has().symbols(1)                               // Must have at least 1 symbol
      .has().not().spaces()                           // Should not have spaces
      .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values


     // load passport module 
      var LocalStrategy    = require('passport-local').Strategy; 
      // load up the user model 
      var User = require('../db/models/users'); 
  
      module.exports = function(passport) { 
          // passport init setup 
          // serialize the user for the session 
          passport.serializeUser(function(user, done) { 
              done(null, user.id); 
          }); 
          //       deserialize the user 
          passport.deserializeUser(function(id, done) { 
              User.findById(id, function(err, user) { 
                  done(err, user); 
              }); 
          }); 
          // using local strategy 
          passport.use('local-login', new LocalStrategy({ 
              // change default username and password, to email 
              //and password 
              usernameField : 'email', 
              passwordField : 'password', 
              passReqToCallback : true 
          }, 
          function(req, email, password, done) { 
              if (email) 
              // format to lower-case 
              email = email.toLowerCase(); 
              // process asynchronous 
              process.nextTick(function() { 
                User.findOne({ 'local.email' :  email }, function(err, user)
                { 
                  // if errors 
                 if (err) 
                   return done(err); 
                 // check errors and bring the messages 
                 if (!user) 
                   return done(null, false, req.flash('loginMessage',
                   'No user found.')); 
                if( ("active" in user.local) && !user.local.active)
                   return done(null, false, req.flash('loginMessage', user.local.name +'. Your access is pending approval. Please try again later.')); 
 
                 if (!user.validPassword(password)) 
                  return done(null, false, req.flash('loginMessage',
                  'Wohh! Wrong password.')); 
                // everything ok, get user 
                else 
                  return done(null, user); 
                }); 
              }); 
           })); 
          // Signup local strategy 
          passport.use('local-signup', new LocalStrategy({ 
              // change default username and password, to email and 
             //  password 
              usernameField : 'email', 
              passwordField : 'password', 
              passReqToCallback : true 
          }, 
          function(req, email, password, done) { 
              if (email) 
              // format to lower-case 
              email = email.toLowerCase(); 
              // asynchronous 
              process.nextTick(function() { 
                  // if the user is not already logged in: 
                  if (!req.user) { 
                      User.findOne({ 'local.email' :  email },
                       function(err,user) { 
                  // if errors 
                  if (err) 
                    return done(err); 

                  // check email 
                  var domain = email.indexOf('@cdc.gov');
                  if (domain<1) {
                    return done(null, false, req.flash('signupMessage',
                     'Sorry, that email address is not allowed.')); 
                   } 
                   if (!schema.validate(password)) {
                    return done(null, false, req.flash('signupMessage',
                     'that password is invalid. (8 to 16 characters, at least one upper case, a lower case, a number, a symbol, and no spaces.')); 
                  }
                  if (user) { 
                    return done(null, false, req.flash('signupMessage',
                     'the email address already exist!')); 
                  }
                  else { 
                    // create the user 
                      var newUser = new User(); 
                      // Get user name from req.body 
                      newUser.local.name = req.body.name; 
                      newUser.local.email = email; 
                      newUser.local.active = false;
                      newUser.local.password =
                       newUser.generateHash(password); 
                      // save data 
                     newUser.save(function(err) { 
                          if (err) 
                            throw err; 
                         
                         return done(null, false, req.flash('signupMessage', 'the administrator must still approve your signup. Please login back later.'));                           
                          //return done(null, newUser); 
                    }); 
                   } 
                }); 
               } else { 
                 return done(null, req.user); 
               }         }); 
          })); 
      }; 
