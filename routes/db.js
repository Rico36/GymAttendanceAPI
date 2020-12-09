const express = require('express'),
    router = express.Router(),
    moment = require("moment"),
    MemberControls = require("../controllers/MemberController.js"),
    DeviceControls = require("../controllers/DeviceController.js"),
    RoomControls = require("../controllers/RoomController.js"),
    CheckinControls = require("../controllers/CheckinController.js"),
    UserControls = require("../controllers/UserController.js");

// Get All 
router.get("/", function (req, res) {
    console.log ("db/");
    res.json( {message:  "ok"});
});

router.get("/checkins", CheckinControls.all);

router.post("/members/create", MemberControls.create);
router.put("/members/update", MemberControls.update);
router.delete("/members/delete", MemberControls.delete);
router.get("/members", MemberControls.all);
router.get("/members/:userid", MemberControls.find);
router.get("/members/activate/:userid", MemberControls.activate);
router.get("/members/deactivate/:userid", MemberControls.deactivate);
router.get("/members/:hhsid", MemberControls.update);

router.post("/rooms/create", RoomControls.create);
router.put("/rooms/update", RoomControls.update);
router.delete("/rooms/delete", RoomControls.delete);
router.get("/rooms", RoomControls.all);
router.get("/rooms/:rm", RoomControls.find);
router.get("/rooms/activate/:rm", RoomControls.activate);
router.get("/rooms/deactivate/:rm", RoomControls.deactivate);

router.post("/devices/create", DeviceControls.create);
router.put("/devices/update", DeviceControls.update);
router.delete("/devices/delete", DeviceControls.delete);
router.get("/devices", DeviceControls.all);
router.get("/devices/:rm", DeviceControls.find);
router.get("/devices/activate/:rm", DeviceControls.activate);
router.get("/devices/deactivate/:rm", DeviceControls.deactivate);

router.post("/users/create", UserControls.create);
router.put("/users/update", UserControls.update);
router.delete("/users/delete", UserControls.delete);
router.get("/users", UserControls.all);
router.get("/users/:email", UserControls.find);
router.get("/users/activate/:email", UserControls.activate);
router.get("/users/deactivate/:email", UserControls.deactivate);

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

module.exports = router;
