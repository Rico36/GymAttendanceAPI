// -----------------------------------------------------
// Simple API for the CDC Wellness Check-in iOS app  v1.0
//
// Author: Ricky Freyre -  3/10/2020
// Note: API can be hosted anywhere including on-prem.
// -----------------------------------------------------------------------
//  Note:  see README.md file for install and setup instructions
// -----------------------------------------------------------------------
// 
// When things goe bad with GIT, just restore from GIT and discard all local uncommited changes
// git reset --hard origin/master
// git pull origin master
// NOTE: using git reset --hard will discard any local uncommitted changes,
//
//
//
require("dotenv").config();
var os = require("os");
const express = require('express');
var app = express();
env = process.env.NODE_ENV || 'development';
var helmet = require('helmet');

// Determine port to listen on
var httpPort = (process.env.PORT || process.env.VCAP_APP_PORT || 8300);
var path = require('path');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var fs = require('fs');
var http = require('http');
var multer = require('multer');

// ................................
// MONGO DB - Connect
// ..................................
const mongoose  = require("mongoose");
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    ;
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

  // Nexrt line is a built-in middleware function in Express. It parses incoming requests 
  // with JSON payloads and is based on body-parser. This will allow our servers to allow incoming .json file format.
  app.use(express.json());

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


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var debug = require('debug')('users');

app.enable('trust proxy');
// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('css', path.join(__dirname+"/public", 'css'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(helmet());
app.use(logger('dev'));

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


// **********************************
// Instantiate the HTTP server now
// **********************************
var httpServer = http.createServer(app);
const server = httpServer.listen(httpPort, () => {
  console.log(`Server is running on host ${os.hostname()} @ http://127.0.0.1:${httpPort}`);
});

module.exports = app;
