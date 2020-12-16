// -----------------------------------------------------
// Simple API for the CDC Wellness Check-in iOS app  v1.0
//
// Author: Ricky Freyre -  3/10/2020
// Note: This API can be hosted in Linux, FreeBSD, Windows and OS X. 
// NOTE: You must set a few environment variables before running !!!! See readme.md file.

// -----------------------------------------------------------------------
//  Note:  see README.md file for install and setup instructions
// -----------------------------------------------------------------------
// 
var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var RoomControls = require("../controllers/RoomController.js");
var DeviceControls = require("../controllers/DeviceController.js");
var MemberControls = require("../controllers/MemberController.js");

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
 const logger = log4js.getLogger('info');


// '''''''''''''''''''''''''''''''''''''''
// GET request for the entire list of members @ http://..../api/
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

//   router.get("/members", MemberControls.find);

   req.app.get('Member').find({}, usersProjection, function (err, users) {
      if (err) {     
         logger.error("Getting /api caught an error: "+err.message);
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
     const updatedMember = await req.app.get('Member').save(res.member);
     } catch (err) {
       logger.error(`Adding/updating member ${req.params.id} caught an error: `+err.message);
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
  try {  console.log("Validating hhsid: "+itemId);
         req.app.get('Member').find({hhsid: { $regex : new RegExp(itemId, "i") }}, usersProjection, function (err, member) {
            if (err) {     
                logger.error("Getting /users caught an error: "+err.message);
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
  try {  console.log("Validating userid: "+itemId);
      req.app.get('Member').find({userid: { $regex : new RegExp(itemId, "i") }}, usersProjection, function (err, member) {
            if (err) {     
               logger.error("Getting /users caught an error: "+err.message);
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

// ''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
// Receives deviceTokens from IOS devices for identification. 
// Returns approval plus other device config data (i.e., room, etc).
// NOTE: This gets called at each IOS device's start-up and also
//        when the user changes the room info inside the IOS device.   
// '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
router.post("/deviceReg", async (request,res) => {
   try {
        await reloadDevices(request)   // re-load the list of authorized devices from db
           .then( deviceList => {
                  devices = deviceList;  // <=== store the list of devices to memory buffer       

                  console.log (`Authorizing device ${request.header('DeviceToken')}...`); 
                  var data = request.body;
                  var device;
                  var approvedDevice;
                  debug( "   Device name: " + data.deviceName+", rm: "+data.rm);
                  debug ("   request.body: "+ JSON.stringify(request.body));
                  logger.info(`Authorizing device ${request.header('DeviceToken')}...`); 
                  logger.info( "Device name: " + data.deviceName+", rm: "+data.rm);
                  if( devices.length >0) { // check if the in-mem buffer is empty
                     // iterate through the in-memory JSON records to find the device's token
                     device = devices.find(_device => _device.deviceToken === data.deviceToken);
                     if( (device) && ("active" in device) && device.active) {  // if device is "activated", then ...
                        if( "rm" in data)  // if the device sent a new room or location info, note that room.
                        {
                           debug( "   data.rm: " + data.rm+", device.rm: "+device.rm);
                           if( (data.rm != device.rm) && (data.rm.trim().length > 1)) // room info is different?
                           {    debug("Changed device's room to: "+data.rm);
                                device.rm = data.rm; // note the new room name 
                                request.ommit=true;
                                DeviceControls.update(request, res);  // update the db
                                logger.info("Changed device's room to: "+data.rm); 

                           }
                        }
                        // sent approval token back to the device as confirmation
                        approvedDevice = { "deviceToken": device.deviceToken, "rm": device.rm , "active": device.active};
                        logger.info( "approvedDevice: " + JSON.stringify(approvedDevice));
                        debug( "approvedDevice: " + JSON.stringify(approvedDevice));
                        res.status(200).json(approvedDevice);
                     }
                     else {  //  The device token was not found or is not "active" ... 
                       debug("In-mem found: "+JSON.stringify(device)); 
                       json = { message: `Device ${data.deviceToken} not registered.`};
                       res.status(404).send(json);
                       debug( `Unregistered: ${data.deviceName}, deviceToken: ${data.deviceToken} `);    
                       logger.info("Unregistered device: "+JSON.stringify(data));  
                       if(!device) {
                           // Add/update the unauthorized device token into the database as "inactive". 
                           // This should allow an operator/admin to easily find new devices and optionally activate/approve them.
                           request.ommit=true;
                           DeviceControls.update(request, res);
                           logger.info("Device saved to db."); 
                        }
                     }
                  }
                  else { // no devices in the list.  Add the caller device into the database as "inactive"  
                     if(devices) 
                        debug("In-mem Devices: "+devices.length); // JSON.stringify(devices));
                     json = { message: `Device ${data.deviceToken} not registered.`};
                     res.status(404).send(json);
                     request.ommit=true;             
                     DeviceControls.update(request, res);
                     logger.info(`Unregistered: ${data.deviceName}, deviceToken: ${data.deviceToken} `);    
                     logger.info("Device saved to db."); 
                     debug( `Unregistered: ${data.deviceName}, deviceToken: ${data.deviceToken} `);      
                  }
               })
               .catch(err => { throw err }); 
      } catch (err) { 
         logger.error("/deviceReg: "+err);  
         console.log('/deviceReg caught: ', err.message);
         res.status(500).json({ message: err.message });
      }
 });


// Download the list of check-ins (.JSON).  Presumably a server will do something with this list and possibly clear the list.
router.get('/checkins/download', authDevice, async (req, res) => {
   console.log ("Sending updated list of check-ins for download");
   // get current membership records 
    var usersProjection = { 
        __v: false,
        _id: false
    };
 
   await req.app.get('Checkin').find({}, usersProjection, function (err, checkins) {
       if (err) {     
          logger.error("Getting /checkins caught an error: "+err.message);
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
router.get("/checkins", async (req, res) => {
   console.log ("Sending updated list of check-ins to device: "+req.header('DeviceToken'));
   // get current membership records 
    var usersProjection = { 
        __v: false,
        _id: false
    };
 
    await req.app.get('Checkin')
         .find({}, usersProjection)
         .then(checkins => { res.json(checkins)})
         .catch(err => {
            logger.error(err).message;
            res.status(500).send(err.message);
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
            debug ( "Adding "+checkins.length + " check-in(s) from device: "+request.header('DeviceToken'));
            await request.app.get('db').collection("checkins").insertMany(checkins,function (err,data) {
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

 router.get("/membersCount",  function(req, res){
   console.log ("/count requested");
   req.app.get('Member')
    .estimatedDocumentCount()
    .then(docCount => {
        console.log(docCount);
        res.json({ count: docCount });
    })
    .catch(err => {
      console.log('/memberCount caught error: ', err.message);
      res.status(500).json({ message: err.message });
   })
});

router.get("/checkinsCount",  function(req, res){
   console.log ("/count requested");
   req.app.get('Checkin')
    .estimatedDocumentCount()
    .then(docCount => {
        console.log(docCount);
        res.json({ count: docCount });
    })
    .catch(err => {
      console.log('/checkinCount caught error: ', err.message);
      res.status(500).json({ message: err.message });
   })
});
 // --------------------------------------------------------------------------------
 // Utilities
 // --------------------------------------------------------------------------------

 // Ensures that the caller's device is one already registered and authorized
 async function authDevice(req, res, next) {
   let device;
   let deviceId = req.header('DeviceToken');
   debug ("authDevice() authorizing: "+ deviceId);
   debug("In-mem Devices: "+devices.length);
   try {
         if( devices.length == 0) {
               await reloadDevices(req)
               .then( deviceList => {
                     devices = deviceList;  // <=== re-load the list of devices to in-mem buffer    
                     //console.log(JSON.stringify(devices));   
                     device = devices.find(_item => _item.deviceToken.toLowerCase() === deviceId.toLowerCase());
   
                  });
         } else {
            //console.log(JSON.stringify(devices));
            device = devices.find(_item => _item.deviceToken.toLowerCase() === deviceId.toLowerCase());
         }
         if( device && ("active" in device) && device.active ) {
            res.device = {deviceAuth: true};
            debug ("authDevice() authorized: "+ deviceId);     
         }
         else {
            debug ("authDevice()  Access denied");
            return res.status(403).json({ message: "Access denied." });
         }
         next();
            
   } catch (err) {
            debug("authDevice() err: Unable to authorize. "+ err.message);
            return res.status(403).json({ message: "Access denied." });
      }
};

async function getDeviceFromDB (token, req) {
   var datProjection = { 
      __v: false,
       _id: false
    };
    let data;
    try {  console.log("token: "+token);
        await req.app.get('Device').find({deviceToken: token}, datProjection, function (err, device) {
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
function reloadDevices(req) {
   console.log ("Re-loading the list of devices");
   return new Promise((resolve, reject) => {
         // get current membership records 
         var datProjection = { 
            __v: false,
            _id: false,
            sessionID: false
         };
         req.app.get('Device').find({}, datProjection, function (err, lstDevices) {
            if (err) {     
               console.log('reloadDevices(): ', err.message);
               return reject(err.message);
            } else {
               // this is a memory variable that holds the list
               debug("reloadDevices() devices= "+JSON.stringify(lstDevices));
               return resolve(lstDevices);
            }
         });
      })
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
