var express = require('express');
var router = express.Router();

// .......................
// @TODO add authentication 
// @TODO add auth middleware
// https://medium.com/better-programming/implementing-authentication-in-nodejs-with-express-and-jwt-codelab-1-c33afbccf1be
//
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CDC GymAttendance API' });
});

module.exports = router;
