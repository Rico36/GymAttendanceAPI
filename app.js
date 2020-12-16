// -----------------------------------------------------
// Simple API for the CDC Wellness Check-in iOS app  v1.0
//
// Author: Ricky Freyre -  3/10/2020
// Note: API can be hosted anywhere including on-prem.
// -----------------------------------------------------------------------
//  Note:  see README.md file for install and setup instructions
// -----------------------------------------------------------------------
// 
//
var os = require("os");
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const flash = require('connect-flash'); 

var app = express();

var env = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var httpPort = (process.env.PORT || process.env.VCAP_APP_PORT || 8300);
var path = require('path');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
//var logger = require('morgan');
var cors = require('cors');
var fs = require('fs');
var http = require('http');
var multer = require('multer');

// ................................
// MONGO DB - Connect
// ..................................
const mongoose  = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/Membership?readPreference=primary&appname=MongoDB%20Compass&ssl=false", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  
  // Database model - tables/collections
  var Member = require("./db/models/Member");
  var Checkin = require("./db/models/Checkin");
  var Device = require("./db/models/Device");
  var Room = require("./db/models/Room");

// Passport configuration 
require('./config/passport')(passport); 

const expressSession = require('express-session')({
  secret: 'lashormigasenfranciacaminanconelegancia',
  resave: false,
  saveUninitialized: false
});

// Next lines are built-in middleware functions in Express. It parses incoming requests, handle session, etc. 
// This will also allow our servers to process incoming .json message formats.

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    app.use(expressSession); 
    // Init passport authentication 
    app.use(passport.initialize()); 
    // persistent login sessions 
    app.use(passport.session()); 
    // flash messages 
    app.use(flash()); 


  var indexRouter = require('./routes/index');
  var apiRouter = require('./routes/api');
  var dbRouter = require('./routes/db');
  var debug = require('debug')('users');
  app.enable('trust proxy');
  // view engine setup
  app.set('view engine', 'ejs');
  //app.set('views', path.join(__dirname, 'views'));
  app.set('views', path.join(__dirname, 'views/pages')); 
  //app.set('css', path.join(__dirname+"/public", 'css'));
  //app.use(express.static(path.join(__dirname, 'public')))
  //set the path of the jquery file to be used from the node_module jquery package  
  app.use('/jquery',express.static(path.join(__dirname+'/node_modules/jquery/dist/')));  

  //set static folder(public) path  
  app.use(express.static(path.join(__dirname+'/public')));  

  // Setup our routes
  app.use('/', indexRouter); 
  app.use('/api', apiRouter);  // API 
  app.use('/db', dbRouter); // CRUD functions and Reports

// Make our db accessible to our routes
  app.set('db',db); 
  app.set('Member',Member); 
  app.set('Checkin',Checkin); 
  app.set('Device',Device); 
  app.set('Room',Room); 

// ----------------------------------- 
// SET FILE UPLOADS naming convention 
// and location of storage.
// --------------------------- 
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
  //  cb(null, file.fieldname + '-' + Date.now())
    cb(null, Date.now()+ '-' +file.originalname);
  }
})
var upload = multer({ storage: storage })

// ------------------------------------------------
// Here we handle receiving uploaded files (.json)
// to save them in the /uploads folder.
// ------------------------------------------------
app.post('/uploads', upload.single("file"), function (req, res) {
  console.log("inside app.post(/upload/dropzone)")
  var file = req.file;
  var filename = file.path; 
  console.log("filename: " + filename);
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  fs.rename(file.path, file.path, function (err) {
      if (err) { 
          console.log(err); 
          res.send({status: false})
      }
      else res.send({status: true, files: req.files});
  });
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

console.log ('Note:  set the debug environment variable to get additional console logs:\r\n  d:> $env:DEBUG = "users"\r\n')
// **********************************
// Instantiate the HTTP server now
// **********************************
var httpServer = http.createServer(app);
const server = httpServer.listen(httpPort, () => {
  console.log(`Server is running on host ${os.hostname()} @ http://127.0.0.1:${httpPort}`);
  debug("Debug is on.");
});


/* REGISTER SOME USERS */
try {
    //UserDetails.register({username:'jrf1', active: false}, 'jrf1')
} catch (err) { console.log("Note: app.js is attempting to register one or more users but got: "+err.message)}

module.exports = app;
