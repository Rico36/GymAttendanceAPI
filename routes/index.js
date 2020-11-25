var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: 'uploads/', keepExtensions: true});


// .......................
// @TODO add authentication 
// @TODO add auth middleware
// https://medium.com/better-programming/implementing-authentication-in-nodejs-with-express-and-jwt-codelab-1-c33afbccf1be
//
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CDC GymAttendance API' });
});

router.get("/dropZone", function (req, res) {
  console.log("GET dropZone!!!");
  res.render("dropZone");
})

router.get("/reports", function (req, res) {
  res.render("reports");
})

module.exports = router;
