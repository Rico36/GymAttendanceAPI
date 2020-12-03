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

router.get("/dropZone", function (req, res) {
  console.log("GET dropZone!!!");
  res.render("dropZone");
})

router.get("/reports", function (req, res) {
  res.render("reports");
})

router.get("/membersGrid", function (req, res) {
  console.log("/membersGrid");
  res.render("membersGrid");
})

router.get("/devicesGrid", function (req, res) {
  console.log("/devicesGrid");
  res.render("devicesGrid");
})

router.get("/roomsGrid", function (req, res) {
  console.log("/roomsGrid");
  res.render("roomsGrid");
})


router.get("/checkinsGrid", function (req, res) {
  console.log("/checkinsGrid");
  res.render("checkinsGrid");
})
module.exports = router;
