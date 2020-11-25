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


/*  MONGO DB - future version dev
const db = require("./db/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

*/

// SET UPLOAD STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
  //  cb(null, file.fieldname + '-' + Date.now())
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
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
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);


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

app.all('/upload', function (req, res, next) {
  console.log('Accessing the secret section ...')
  next() // pass control to the next handler
})

//app.use(helmet());
app.use(logger('dev'));
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


// Instantiate the HTTP server
var httpServer = http.createServer(app);
//httpServer.listen(httpPort, () => {     // <== for debug purpose
httpServer.listen(httpPort, "127.0.0.1", () => {
  console.log("Http server at http://127.0.0.1:" + httpPort)
});


module.exports = app;
