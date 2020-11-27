// -----------------------------------------------------
// Simple API for the CDC Wellness Check-in iOS app  v1.0
//
// Author: Ricky Freyre -  3/10/2020
// Note: This API can be hosted in Linux, FreeBSD, Windows and OS X. 
// NOTE: You must set a few environment variables before running !!!! See readme.md file.
//
// DEPLOY AND RUN :
//   d:> git commit -m "update commit"
//   d:> npm start 
// -----------------------------------------------------------------------
//  Note:  see README.md file for install and setup instructions
// -----------------------------------------------------------------------
// 

var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Global variables
// My config file
//
require("dotenv").config();
const config = require('../config.json')
// Request path module for relative path
const path = require('path')

// Request File System Module
var fs = require('fs');

var debug = require('debug')('users');
var os = require("os");


// ................................
// MONGO DB - Connect
// ..................................
const mongoose  = require("mongoose");
//   const conStr = 'mongodb+srv://lord:<PASSWORD>@cluster0-eeev8.mongodb.net/tour-guide?retryWrites=true&w=majority';
//   const DB = conStr.replace('<PASSWORD>','ADUSsaZEKESKZX');
mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to the database!");
    })
    .catch(err => {
      console.log("Cannot connect to the database!", err);
      process.exit();
    });
// get reference to database
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// Database table
var Member = require("../db/models/Member");
var Checkin = require("../db/models/Checkin");
var Device = require("../db/models/Device");

// Holds the entire list of registered devices in memory
var devices =  [];

// Create file logging
const log4js = require("log4js");
log4js.configure({
   appenders: {
     multi: { type: 'multiFile', base: 'logs/', property: 'categoryName', extension: '.log' }
   },
   categories: {
     default: { appenders: [ 'multi' ], level: 'debug' }
   }
 });

// '''''''''''''''''''''''''''''''''''''''
// GET request for the entire list of users @ http://..../users
// Allows working offline!!
// '''''''''''''''''''''''''''''''''''''''
// Get All Route
router.get("/", authDevice, async (req, res) => {
  device = req.header('DeviceToken');
  console.log ("Sending updated list of users/members to device: "+req.header('DeviceToken'));
  // get current membership records 
   var usersProjection = { 
       __v: false,
       _id: false
   };

   Member.find({}, usersProjection, function (err, users) {
      if (err) {     
         const logger = log4js.getLogger('error');
         logger.info("Getting /users caught an error: "+err.message);
         console.log('caught', err.message);
         res.status(500).json({message: err.message})
      } else {
         res.json(users)
      }
   });    
});

// '''''''''''''''''''''''''''''''''''''''
// Add or replace individual member.
//              
 router.post("/hhsid/:hhsid", authDevice, async (req, res) => {
   if (req.body.Firstname != null) {
     res.member.Firstname = req.body.Firstname;
   }
   if (req.body.Lastname != null) {
     res.member.Lastname = req.body.Lastname;
   }
   if (req.body.hhsid != null) {
      res.member.hhsid = req.body.hhsid;
    }
    if (req.body.userid != null) {
      res.member.userid = req.body.userid;
    }
     if (req.body.active != null) {
      res.member.active = req.body.active;
    }
    try {
     const updatedMember = await res.member.save();
     } catch (err) {
       const logger = log4js.getLogger('error');
       logger.info(`Adding/updating member ${req.params.id} caught an error: `+err.message);
       res.status(400).json({ message: err.message });
      }
 });

// '''''''''''''''''''''''''''''''''''''''
// GET individual verification by USER-ID or HHSID.
// '''''''''''''''''''''''''''''''''''''''
router.get("/hhsid/:hhsid", authDevice, async (req, res) => {
   const itemId = req.params.hhsid;
   var usersProjection = { 
      __v: false,
      _id: false
  };
  try {  //console.log("hhsid: "+itemId);
         Member.find({hhsid: { $regex : new RegExp(itemId, "i") }}, usersProjection, function (err, member) {
            if (err) {     
               const logger = log4js.getLogger('error');
               logger.info("Getting /users caught an error: "+err.message);
               console.log('caught', err.message);
               res.status(500).json({message: err.message})
            } else {
               res.json(member)
            }
         });    
      } catch (err) {
         res.status(500).json({ message: err.message });
       }
 });

 router.get("/userid/:userid", authDevice, async (req, res) => {
   const itemId = req.params.userid;
   var usersProjection = { 
      __v: false,
      _id: false
  };
  try {  //console.log("userid: "+itemId);
         Member.find({userid: { $regex : new RegExp(itemId, "i") }}, usersProjection, function (err, member) {
            if (err) {     
               const logger = log4js.getLogger('error');
               logger.info("Getting /users caught an error: "+err.message);
               console.log('caught', err.message);
               res.status(500).json({message: err.message})
            } else {
               res.json(member)
            }
         });    
      } catch (err) {
         res.status(500).json({ message: err.message });
       }
 });

// '''''''''''''''''''''''''''''''''''''''
// Receives deviceTokens from IOS devices  
// Returns approval plus other device config data.
// '''''''''''''''''''''''''''''''''''''''
router.post("/deviceReg", async (request,res) => {
   try {
         if( devices.length == 0)
           await reloadDevices();
         
         debug (`Authorizing device ${request.header('DeviceToken')}...`); // + JSON.stringify(request.body));  
         var data = JSON.parse(JSON.stringify(request.body));
         debug( "   Device name: " + data.name);
         // iterate through the in-memory JSON records to find the device
         var approvedDevice = devices.find(_device => _device.deviceToken === data.deviceToken);
         res.set('Content-Type', 'text/json');
         debug( "approvedDevice: " + JSON.stringify(approvedDevice));
         if (approvedDevice) {
            const logger = log4js.getLogger('regDevices');
            logger.info(JSON.stringify(request.body));
            logger.info(JSON.stringify(approvedDevice) + " / "+ `sessionID: ${data.sessionID}`);
            res.status(200).json(approvedDevice);
         } else {
            // check if this device was recently added to the database
            console.log("Checking if device is in the database..");
            await getDeviceFromDB(data.deviceToken).then(device => {
                console.log("device: "+ JSON.stringify(device));
                 if( device != null) {
                     debug( "approvedDevice: " + JSON.stringify(device));
                     res.status(200).json(device);
                     reloadDevices();
                 }
                 else { // Not registered. Butt off.
                  json = { message: `Device ${data.deviceToken} not registered.`};
                  const logger = log4js.getLogger('UnregDevices');
                  logger.info(`Device named: ${data.name}, deviceToken: ${data.deviceToken} `);
                  console.log( `Unregistered: ${data.name}, deviceToken: ${data.deviceToken} `);
                  res.status(404).send(json);
                 }
            })
         }
      } catch (err) { 
         const logger = log4js.getLogger('error');
         logger.error("/deviceReg: "+err);  
         console.log('/deviceReg caught: ', err.message);
         res.status(500).json({ message: err.message });
      }
 });




// Download the list of check-ins (.JSON).  Presumably a server will do something with this list and possibly clear the list.
router.get('/checkins/download', async (req, res) => {
   console.log ("Sending updated list of check-ins for download");
   // get current membership records 
    var usersProjection = { 
        __v: false,
        _id: false
    };
 
   await Checkin.find({}, usersProjection, function (err, checkins) {
       if (err) {     
          const logger = log4js.getLogger('error');
          logger.info("Getting /checkins caught an error: "+err.message);
          console.log('caught', err.message);
          res.status(500).json({message: err.message})
       } else {
           ; /* Download a copy of the entire file */
           res.setHeader('Content-disposition', 'attachment; filename=checkins.json');
           res.set('Content-Type', 'text/json');
           res.status(200).send(checkins);       
         }
    });  
});
//
// '''''''''''''''''''''''''''''''''''''''
// GET request will dump the entire list of check-ins 
// records to the browser screen for viewing.
// '''''''''''''''''''''''''''''''''''''''
router.get("/checkins", authDevice, async (req, res) => {
   console.log ("Sending updated list of check-ins to device: "+req.header('DeviceToken'));
   // get current membership records 
    var usersProjection = { 
        __v: false,
        _id: false
    };
 
    Checkin.find({}, usersProjection, function (err, checkins) {
       if (err) {     
          const logger = log4js.getLogger('error');
          logger.info("Getting /checkins caught an error: "+err.message);
          console.log('caught', err.message);
          res.status(500).json({message: err.message})
       } else {
          res.json(checkins)
       }
    });    
 });
 
 
// '''''''''''''''''''''''''''''''''''''''
// Receives new check-in records from the field
// and stores/appends them to a file in the network
// '''''''''''''''''''''''''''''''''''''''
 router.post("/checkinData", authDevice, async (request,response) => {
   try {
            // get current checkins records held in storage 
            var checkins= request.body;
            //console.log ("Got a POST request with: "+ JSON.stringify(request.body));  
            debug ( "Adding "+checkins.length + " check-in(s) from device: "+request.header('DeviceToken'));
            await db.collection("Checkin").insertMany(checkins,function (err,data) {
               ;  
            })
           response.json('message: ok');
           debug("Completed");
         } catch (err) { 
               const logger = log4js.getLogger('error');
               logger.error("/checkinData: "+err);
               console.log("/checkinData: "+err);
               response.status(500).json({ message: err.message });
            }
  });

// '''''''''''''''''''''''''''''''''''''''
// Delete individual member from database.
// '''''''''''''''''''''''''''''''''''''''
// router.delete("/:id", authDevice, async (req, res) => {
//    try {
//      await res.user.deleteOne();
//      res.json({ message: "Member has been deleted" });
//    } catch (err) {
//      res.status(500).json({ message: err.message });
//    }
//  });

 router.get("/count",  function(req, res){
   console.log ("/count requested");
   Member
    .estimatedDocumentCount()
    .then(docCount => {
        console.log(docCount);
        res.json({ count: docCount });
    })
    .catch(err => {
      console.log('/count caught error: ', err.message);
      res.status(500).json({ message: err.message });
   })
});

 // --------------------------------------------------------------------------------
 // Utilities
 // --------------------------------------------------------------------------------

 // Ensures that the caller's device is one already registered and authorized
 async function authDevice(req, res, next) {
   let deviceId = req.header('DeviceToken');
   //debug ("authDevice() authorizing: "+ deviceId);
   try {
      const deviceInfo = devices.find(_item => _item.deviceToken.toLowerCase() === deviceId.toLowerCase());
      if (deviceInfo == null) {
         return res.status(404).json({ message: "Unable to authorize." });
      }
      res.device = {deviceAuth: true};
      debug ("authDevice() authorized: "+ deviceId);  
      next();
   
   } catch (err) {
      debug("authDevice() err: Unable to authorize. "+ err.message);
      return res.status(500).json({ message: "Access denied." });
   }
};

async function getDeviceFromDB (token) {
   var datProjection = { 
      __v: false,
       _id: false
    };
    let data;
    try {  console.log("token: "+token);
        await Device.find({deviceToken: token}, datProjection, function (err, device) {
             data=device;
             return device;
         })
      } catch (err) {
         console.log('getDevice() err: ', err.message);
      }
      return data;
 };

// --------------------------
// Load the list of devices 
// --------------------------
function reloadDevices() {
   console.log ("Re-loading the list of devices");
   // get current membership records 
   var datProjection = { 
      __v: false,
      _id: false
   };
    Device.find({}, datProjection, function (err, lstDevices) {
      if (err) {     
         console.log('loadDevices(): ', err.message);
      } else {
         // this is a memory variable that holds the list
         devices = lstDevices;
      }
   });
}    

 // -------------------
 // checks if the file exists. 
 // If it doesn't, then the file is created.
 function checkForFile(filepath, fileSizeInBytes)
 {
     fileSizeInBytes = 0.0;
     fs.exists(filepath, function (exists) {
         if(!exists)
         {
            fs.closeSync(fs.openSync(filepath, 'w')); // create an empty file
         }
         else {
            var stats = fs.statSync(filepath)  // otherwise, return current file size
            fileSizeInBytes = stats["size"];
         }
     });
 };

 function readFile(srcPath) {
   return new Promise(function (resolve, reject) {
       fs.readFile(srcPath, 'utf8', function (err, data) {
           if (err) {
               reject(err)
           } else {
            resolve(data);
           }
       });
   })
};

function writeFile(savPath, data) {
   return new Promise(function (resolve, reject) {
       fs.writeFile(savPath, data, function (err) {
           if (err) {
               reject(err)
           } else {
               resolve();
           }
       });
   })
};

module.exports = router;
