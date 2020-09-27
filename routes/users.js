var express = require('express');
var router = express.Router();

// -----------------------------------------------------
// Simple API for the CDC Wellness Check-in iOS app  v1.0
//
// Author: Ricky Freyre (JRF1@CDC.GOV)  3/10/2020
// Note: API is hosted at a heroku server but can be hosted
// anywhere including on-prem.
//
// DEPLOY AND RUN IN HEROKU SERVER:
//   d:> git commit -m "update commit"
//   d:> git push heroku master     (produced: https://gym-attendance-api.herokuapp.com/ )
// OTHERWISE, RUN LOCAL:
//   d:> npm start 
// -----------------------------------------------------------------------
//  Note:  see README.md file for install and setup instructions
// -----------------------------------------------------------------------
// 
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
//AWS.config.loadFromPath('./aws_config.json');  // <== not a good idea to store secrets as an unencrypted file in the root dir. (see readme.md) 
// Set the Region 
AWS.config.update({region: 'us-east-1'});
// AWS S3 bucket we will use to save new checkins
const S3_BUCKET = process.env.S3_BUCKET;
// Create S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Global variables
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

   debug ("Got a GET request for list of users/members");
   const filename = 'data.json';  // <== we store the membership list here

   readFile(filename, function(response) {
      // get current membership records held in S3 storage (AWS)
      // Keeps a copy in memory as well for fast response when clients request individuals/members verification.
      users =  JSON.parse(''+ response)
      /* Send a copy of the file back to the caller(s) (Gym iPads/iPhones)*/
      res.send(users);
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
   const filename = 'checkins.json';
   retrieveFile(filename, res);
});
//
// '''''''''''''''''''''''''''''''''''''''
// GET request will dump the entire list of check-ins 
// records to the browser screen for viewing.
// '''''''''''''''''''''''''''''''''''''''
router.get("/checkins", function(req, res) {
   const filename = 'checkins.json';
   var checkinData = '';
   readFile(filename, function(response) {
      // get current checkins records held in S3 storage (AWS)
      checkinData = ''+ response;
    //  console.log('/checkins:'+ checkinData);
      checkinData = checkinData.replace(/\n/g, "<br />");
   //   response = response.replace(/\r\n/g, "<br />");
      checkinData = "[" + checkinData + "]";
      /* Just send the file */
      res.send(checkinData);
   });

 });


// '''''''''''''''''''''''''''''''''''''''
// Receives new check-in records from the field
// and stores/appends them in an AWS's S3 bucket file
//
// in order to enable access to the S3 on my account, 
// the AWS acces key must be found in an environment variable:   
//  
// If this is running in a heroku server, do this:
// >heroku config:set AWS_ACCESS_KEY_ID=AKIAWODOEVRK6NYCWD7X AWS_SECRET_ACCESS_KEY=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
// >heroku config:set S3_BUCKET=mybucket.freyre
// '''''''''''''''''''''''''''''''''''''''
 router.post("/checkinData", (request,response) => {
   try {
         const filename = 'checkins.json' //  path.join(process.cwd(), '/data/data.txt');
         debug ("Got a POST request with: "+ JSON.stringify(request.body));  
         // iterate through the JSON records received but stored them as comma separated format (CVS)
         var arr = JSON.parse(JSON.stringify(request.body));
         var cnt =0;
         var records=''; // get current checkins records held in S3 storage (AWS)
         readFile(filename, function(response) {
            // get current checkins records held in S3 storage (AWS)
            records = ''+response; 
            debug ( 'records='+ records);
            for(var i = 0; i < arr.length; i++)
            {  cnt += 1;
               records += '{ "userid": "'+ arr[i].userid + '", "date": "'+ arr[i].dt.trim().replace(",", " ") + '", "lat": ' + arr[i].loc.lat + ', "lng": '+ arr[i].loc.lng + ' },'+os.EOL
            }
            // append data to file
            console.log(cnt +' records(s) appended to S3');
            if( cnt > 0)
               uploadFile('checkins.json', records) // upload the new check-in records to S3
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
//  function readFile(srcPath) {
//    return new Promise(function (resolve, reject) {
//        fs.readFile(srcPath, 'utf8', function (err, data) {
//            if (err) {
//                reject(err)
//            } else {
//                resolve(data);
//            }
//        });
//    })
// }

// function writeFile(savPath, data) {
//    return new Promise(function (resolve, reject) {
//        fs.writeFile(savPath, data, function (err) {
//            if (err) {
//                reject(err)
//            } else {
//                resolve();
//            }
//        });
//    })
// }

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

 // read AWS S3 File into memory. This function gets a file (.json) from AWS Bucket into a memory variable that 
 // can be accessed by the code that called this function.
function readFile(filename, callback) {

   const getParams = {Bucket: 'mybucket.freyre/input-files', Key: filename};
 
   s3.getObject(getParams, function(err, data) {
     if (err){
        console.log('readFile('+filename+') error:'+err);
        return callback(''); // res.status(400).send({success:false,err:err});
     }
     else{
      // debug('readFile('+filename+') returned:'+data.Body);
       return callback(data.Body);
     }
   });
 };

// retrieveFile function gets an AWS S3 file (.json) from an AWS Bucket but sends it back to the 
// external API caller (web user/client) in the body of the web response.  
function retrieveFile(filename,res){

   const getParams = {Bucket: 'mybucket.freyre/input-files', Key: filename};
 
   s3.getObject(getParams, function(err, data) {
     if (err){
       return res.status(400).send({success:false,err:err});
     }
     else{
      return res.send(data.Body);
     }
   });
 }

module.exports = router;
