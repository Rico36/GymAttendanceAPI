const express = require('express'),
    router = express.Router(),
    moment = require("moment"),
    MemberControls = require("../controllers/MemberController.js"),
    DeviceControls = require("../controllers/DeviceController.js"),
    RoomControls = require("../controllers/RoomController.js"),
    CheckinControls = require("../controllers/CheckinController.js"),
    UserControls = require("../controllers/UserController.js");

// Get All 
router.get("/", isLoggedIn, function (req, res) {
    console.log ("db/");
    res.json( {message:  "ok"});
});

router.get("/checkins", CheckinControls.all);

router.post("/members/create", isLoggedIn, MemberControls.create);
router.put("/members/update", isLoggedIn, MemberControls.update);
router.delete("/members/delete", isLoggedIn, MemberControls.delete);
router.get("/members", isLoggedIn, MemberControls.all);
router.get("/members/:userid", isLoggedIn, MemberControls.find);
router.get("/members/activate/:userid", isLoggedIn, MemberControls.activate);
router.get("/members/deactivate/:userid", isLoggedIn, MemberControls.deactivate);
router.get("/members/:hhsid", isLoggedIn, MemberControls.update);

router.post("/rooms/create", isLoggedIn, RoomControls.create);
router.put("/rooms/update", RoomControls.update);
router.delete("/rooms/delete", isLoggedIn, RoomControls.delete);
router.get("/rooms", isLoggedIn, RoomControls.all);
router.get("/rooms/:rm", isLoggedIn, RoomControls.find);
router.get("/rooms/activate/:rm", isLoggedIn, RoomControls.activate);
router.get("/rooms/deactivate/:rm", isLoggedIn, RoomControls.deactivate);

router.post("/devices/create", isLoggedIn, DeviceControls.create);
router.put("/devices/update", DeviceControls.update);
router.delete("/devices/delete", isLoggedIn, DeviceControls.delete);
router.get("/devices", DeviceControls.all);
router.get("/devices/:rm", DeviceControls.find);
router.get("/devices/activate/:rm", isLoggedIn, DeviceControls.activate);
router.get("/devices/deactivate/:rm", isLoggedIn,  DeviceControls.deactivate);

router.post("/users/create", isLoggedIn, UserControls.create);
router.put("/users/update", isLoggedIn, UserControls.update);
router.delete("/users/delete", isLoggedIn,  UserControls.delete);
router.get("/users", isLoggedIn, UserControls.all);
router.get("/users/:email", isLoggedIn, UserControls.find);
router.get("/users/activate/:email", isLoggedIn, UserControls.activate);
router.get("/users/deactivate/:email", isLoggedIn,  UserControls.deactivate);

router.get("/reports").post((req, res, next) => {
  var startDate = moment(req.body.currentDate)
      .startOf("month")
      .toDate();
  var endDate = moment(req.body.currentDate)
      .endOf("month")
      .add(1, "days")
      .toDate();
      req.app.get('Checkin').aggregate([
       {
           $match: {
               date: {
                   $gte: startDate,
                   $lt: endDate
               }
           }
       },
       {
           $group: {
              _id: "$rm", totCheckins: { $sum: 1 }
            }
        }
   ]).exec((err, result) => {
        if( err) {
            return next(err);
        } else {
            // TDB
        }
    })
})

/* check if user is logged in */ 
function isLoggedIn(req, res, next) { 
    if (req.isAuthenticated()) 
        return next(); 
    
    res.status(403).send("access denied");
  } 

module.exports = router;
