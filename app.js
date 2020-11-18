// -----------------------------------------------------
// Simple API for the CDC Wellness Check-in iOS app  v1.0
//
// Author: Ricky Freyre -  3/10/2020
// Note: API can be hosted anywhere including on-prem.
// -----------------------------------------------------------------------
//  Note:  see README.md file for install and setup instructions
// -----------------------------------------------------------------------
// 
// openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.cert -days 365
// openssl rsa -in server.key -out server.pem     //(decrypted keys)
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

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var debug = require('debug')('users');

app.enable('trust proxy');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));  // to serve static files (i.e., images, CSS files, etc) in a directory named "public"

app.use('/', indexRouter);
app.use('/users', usersRouter);
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
httpServer.listen(httpPort, () => {
  console.log("Http server listing on port : " + httpPort)
});

module.exports = app;
