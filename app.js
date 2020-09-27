// .........................
// TO CREATE A NEW NODE EXPRESS APP
// https://expressjs.com/en/starter/generator.html
// .........................
// Use the application generator tool, express-generator, to quickly create an application skeleton.
// You can run the application generator with the npx command (available in Node.js 8.2.0):
//
//  d:> npx express-generator
//  
// the following creates an Express app named GymAttendanceAPI:
//  d:> express GymAttendanceAPI
//
// Then install dependencies:
//  d:> cd GymAttendanceAPI
//  d:> npm install
//  d:> set DEBUG=GymAttendanceAPI:* & npm start  (on Windows command prompt)
// or
//  PS> $env:DEBUG='GymAttendanceAPI:*'; npm start    (on Windows Powershell)
//
//  Then load http://localhost:3000/ in your browser to access the app.
//  or type:  code .   (to run VS Code)
//
// git + deployment instructions: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/deployment
//
const express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var debug = require('debug')('users');

var app = express();

app.use(cors({origin: 'http://localhost:3001'}));   // the actual API URL on the browser is: http://localhost:3000/users/


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));  // to serve static files (i.e., images, CSS files, etc) in a directory named "public"

app.use('/', indexRouter);
app.use('/users', usersRouter);


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

module.exports = app;
