// -----------------------------------------------------
// Simple API for the CDC Wellness Check-in iOS app  v1.0
//
// Author: Ricky Freyre (JRF1@CDC.GOV)  3/10/2020
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
var httpsPort = (process.env.HTTPSPORT || 8443);
var path = require('path');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var fs = require('fs');
var http = require('http');
//For https   (https://stackoverflow.com/questions/21397809/create-a-trusted-self-signed-ssl-cert-for-localhost-for-use-with-express-node)
// CD D:\project\certificates\
// D:> openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout cert.key -out cert.pem -config req.cnf -sha256
//
const https = require('https');
const httpsOptions = {
  key: fs.readFileSync('./certificates/cert.key'),
  cert: fs.readFileSync('./certificates/cert.pem')
  //  ca: fs.readFileSync('certificates/ca_bundle.crt')
}



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

var forceSsl = function (req, res, next) {
  console.log('forceSSL' )
  if (req.headers['x-forwarded-proto'] !== 'https') {
     console.log("type:"+req.headers['x-forwarded-proto'] )
     return res.redirect(['https://', req.get('Host'), req.url].join(''));
 }
 return next();
};

var httpsServer = https.createServer(httpsOptions, app);

if (env != 'production') {
  // Only the Development environment allows non-SSL calls
  var httpServer = http.createServer(app);
  httpServer.listen(httpPort, () => {
    console.log("Http server listing on port : " + httpPort)
  });
}
httpsServer.listen(httpsPort, () => {
  console.log("Https server listing on port : " + httpsPort)
  app.use(forceSsl);
});

if (env === 'production') {
  console.log('We are in production. Non-SSL calls will be auto-redirected to SSL.')
  app.use(forceSsl);
}


module.exports = app;
