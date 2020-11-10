var express = require('express');
var router = express.Router();

// -----------------------------------------------------
// Simple API for the CDC Wellness Check-in iOS app  v1.0
//
// Author: Ricky Freyre (JRF1@CDC.GOV)  3/10/2020
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
// Global variables
// My config file
const config = require('../config.json')
// Request path module for relative path
const path = require('path')

// Request File System Module
var fs = require('fs');

var debug = require('debug')('users');
var os = require("os");

// Holds the entire list of registered users/members in memory
var users =  null // JSON.parse(fs.readFileSync('./data/data.json', 'utf8'));


// '''''''''''''''''''''''''''''''''''''''
// GET request for the entire list of users @ http://..../users
// Allows working offline!!
// '''''''''''''''''''''''''''''''''''''''
  router.get('/', function (req, res) {

   console.log ("Got a GET request for list of users/members");
   // get current membership records held in shared drive
   readFile(config.membersData).then(function (fileContent) {
      // Keeps a copy in memory as well for fast response when clients request individuals/members verification.
      users =  JSON.parse(fileContent)
      /* Send a copy of the entire membership back to the caller(s) (Gym iPads/iPhones)*/
      res.send(users);
   }).catch(err => {
      // Will not execute
      console.log('caught', err.message);
    });
 });  

 // '''''''''''''''''''''''''''''''''''''''
// GET individual verification by HHS-ID .              NOTE:  search memory but could be adapted to search a Database
// '''''''''''''''''''''''''''''''''''''''
router.get("/hhsid/:hhsid", (req, res) => {
   const itemId = req.params.hhsid;
   const item = users.find(_item => _item.hhsid === itemId);
   debug ("Got a GET request for HHS-id: "+itemId);

   if (item) {
      res.json(item);
   } else {
      res.json({ message: `item ${itemId} doesn't exist`})
   }
});

// '''''''''''''''''''''''''''''''''''''''
// GET individual verification by USER-ID .             NOTE:  search memory but could be adapted to search a Database
// '''''''''''''''''''''''''''''''''''''''
router.get("/userid/:userid", (req, res) => {
 const itemId = req.params.userid;
 const item = users.find(_item => _item.userid.toLowerCase() === itemId.toLowerCase());
 debug ("Got a GET request for user id: "+itemId);

 if (item) {
    res.json(item);
 } else {
    res.json({ message: `item ${itemId} doesn't exist`})
 }
});

// Download the list of check-ins (.JSON).  Presumably a server will do something with this list and possibly clear the list.
router.get('/checkins/download', function(req, res){
   // get current pending check-in records held in shared drive
   readFile(config.checkinData).then(function (fileContent) {
      /* Download a copy of the entire file */
      res.setHeader('Content-disposition', 'attachment; filename=checkins.json');
      res.set('Content-Type', 'text/json');
      res.status(200).send(fileContent);
   }).catch(err => {
      // Will not execute
      console.log('caught', err.message);
      });
});
//
// '''''''''''''''''''''''''''''''''''''''
// GET request will dump the entire list of check-ins 
// records to the browser screen for viewing.
// '''''''''''''''''''''''''''''''''''''''
router.get("/checkins", function(req, res) {
   var checkinData = '';
   // get current pending check-in records held in shared drive
   readFile(config.checkinData).then(function (fileContent) {
      checkinData = ''+fileContent
      checkinData = checkinData.replace(/\n/g, "<br />");
      checkinData = "[" + checkinData + "]";
      /* return a copy of the entire file */
      res.send(checkinData);
   }).catch(err => {
      // Will not execute
      console.log('caught', err.message);
      });
 });


// '''''''''''''''''''''''''''''''''''''''
// Receives new check-in records from the field
// and stores/appends them to a file in the network
// '''''''''''''''''''''''''''''''''''''''
 router.post("/checkinData", (request,response) => {
   try {
         debug ("Got a POST request with: "+ JSON.stringify(request.body));  
         // iterate through the JSON records received but stored them as comma separated format (CVS)
         var arr = JSON.parse(JSON.stringify(request.body));
         var cnt =0;
         var records=''; // get current checkins records 
      //  readFile(filename, function(response) {
         readFile(config.checkinData).then(function (fileContent) {
            // get current checkins records held in storage 
            records = ''+fileContent; 
            debug ( 'records='+ records);
            for(var i = 0; i < arr.length; i++)
            {  cnt += 1;
               records += '{ "userid": "'+ arr[i].userid + '", "date": "'+ arr[i].dt.trim().replace(",", " ") + '", "lat": ' + arr[i].loc.lat + ', "lng": '+ arr[i].loc.lng + ' },'+os.EOL
            }
            // append data to file
            console.log(cnt +' records(s) appended to ' + config.checkinData);
            if( cnt > 0)
               writeFile(config.checkinData, records) // save the new check-in record(s) 
                  .catch(err => {
                     // Will not execute
                     console.log('caught', err.message);
                     });
          });
          response.json('message: ok');

      } catch (err) { console.error('POST error: '+ err); response.json('message: '+err); }
     
 });

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
 }
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
}

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
}

//The uploadFile function writes a file (targetName) into an AWS Bucket
function uploadFile(targetName, filedata){
   debug ('preparing to upload to S3...');
   const putParams = {
      Bucket      : 'mybucket.freyre/input-files',
      Key         : targetName,
      Body        : filedata
   };
   s3.putObject(putParams, function(err, data){
      if (err) {
         console.log('Could not upload the file. Error :',err);
         throw err;
      } 
      else{
         debug('Successfully uploaded Check-in data to S3');
      }
   })
 };

module.exports = router;
