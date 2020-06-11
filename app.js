// .........................
//  npx express-generator
//  npm install -g express-generator
//  express GymAttendanceAPI
//  cd GymAttendanceAPI
//  npm install
//  npm install cors --save
//  code .   // run VS Code
//
// git + deployment instructuons: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/deployment
//
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

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
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/data', express.static(__dirname + '/data'));  
app.use(express.static(__dirname + '/data')); 


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
