var express = require('express');
var router = express.Router();


// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
//AWS.config.update({region: 'us-east-1'});
//AWS.config.loadFromPath('./aws_config.json');
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

// Read the entore list of regstered users into memory
var users =  JSON.parse(fs.readFileSync('./data/data.json', 'utf8'));

// -----------------------------------------------------------------------
//  Note:  to deploy to heroku from git repository:
//
//  1- Ceate a HEROKU account online, verify your email account, 
//  2- downloaad and install the Heroku CLI for Windows 64-bit 
//  3- make sure you also have installed git in windows.
//  4- open windows command or the VS Code terminal windows, and type these:
//  cd d:\src\GymAttendanceAPI  (this is where your app resides)
//
//  git init (Note: only if the git repo was not previously created)
//  heroku login 
//  heroku create gym-attendance-api   (note: lowercase only. This creates a separate git repo for Heroku named: gym-attendance-api)
//  heroku git:remote -a gym-attendance-api
//  git add .
//  git commit -am "initial commit"
//  git push heroku master                     (produced: https://gym-attendance-api.herokuapp.com/ )
//  heroku open  
//
//  NOTE: to stop the server API use command:
//   heroku maintenance:off -a gym-attendance-api       
//   heroku ps:scale web=0 --app gym-attendance-api 
//  to restart the server do:
//   heroku maintenance:on -a gym-attendance-api 
//   heroku ps:scale web=1 --app gym-attendance-api 
// -----------------------------------------------------------------------
//  to update with a new version 
//    1) commit to git all code changes.  Use the vs code source control
//    2) copy/backup the data.txt file from heroku by downloading it to a temp directory (see below) 
//    2) git push heroku master 
// -----------------------------------------------------------------------
//  to download the ./data/data.txt file from heroku to a temp dir do this:
//    cd d:\src
//    del data.txt
//    heroku ps:copy ./data/data.txt --app gym-attendance-api
//    more data.txt  
//
// '''''''''''''''''''''''''''''''''''''''
// GET request for the entire list of users 
// Allows working offline!!
// '''''''''''''''''''''''''''''''''''''''
router.get('/', function (req, res) {

    debug ("Got a GET request for list of users");
    
    /* Just send the file as JSON*/
    res.send(users);
  });  

//GET method route for downloading/retrieving file
router.get('/checkins/download', function(req, res){
   const filename = 'checkins.json';
   retrieveFile(filename, res);
});
//
// '''''''''''''''''''''''''''''''''''''''
// GET request will dump the entire list of check-ins 
// records to the browser screen.
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
// GET request will download the entire list of check-ins 
// records to a file.
// '''''''''''''''''''''''''''''''''''''''
// router.get('/checkins/download', function (req, res) {
//    try {
//       const filePath = path.join(process.cwd(), '/data/data.txt');
//       let destFileName = path.join(process.cwd(), '/data/checkins.txt');
//       console.log ("Downloading the check-in(s) file.");  
//       debug  ('filePath=' + filePath);
//       var fileSizeInBytes = 0.0;
//       checkForFile(filePath, fileSizeInBytes);  // create the output data file only if it doesn't exist
//       if( fileSizeInBytes < 1.0)
//          debug ( "File size is less than one megabyte" ) ;
//       else
//          console.log ( "File size is ~" + (fileSizeInBytes / 1000000.0 ) + ' MB(s) long.' ) ;

//      // append a date stamp to the file name
//      destFileName = destFileName.split('.').join('-' + Date.now() + '.');
//      debug ('destFileName=' + destFileName);
//      readFile(filePath).then(function(results) {
//             results = "[" + results + "]";
//             // console.log  (results);
//             return writeFile(destFileName, results);
//        }).then(function(){
//          //done modifying file, send it for download
//          res.download(destFileName, function(err){
//             //CHECK FOR ERROR
//             if (err) throw err;
//             else
//                console.log('download completed!');
//                try {
//                   fs.unlinkSync(destFileName)
//                   debug("Successfully deleted the temp file.")
//                  } catch(err) {
//                      throw err
//                  }
//          }) // end download
//       }); // end .then

//    } catch (err) { console.error('GET error: '+ err); res.json('message: '+err); }

//  });  


// '''''''''''''''''''''''''''''''''''''''
// GET individual record by HHS-ID .              TBD: It search memory. Database not implemented yet
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
// GET individual record by USER-ID .             TBD: It search memory. Database not implemented yet
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

// '''''''''''''''''''''''''''''''''''''''
// Receives new check-in records from the field
// and stores them in an AWS's S3 bucket
//
// in order to enable access to the S3 on my account, 
// some AWS configurations must be performed.  See: 
// 
// heroku command lines needed:
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

//The uploadFile function
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

 // read S3 File function
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

//The retrieveFile function
function retrieveFile(filename,res){

   const getParams = {Bucket: 'mybucket.freyre/input-files', Key: filename};
 
   s3.getObject(getParams, function(err, data) {
     if (err){
       return res.status(400).send({success:false,err:err});
     }
     else{
      return res.send(data.Body);
//      return res.send('['+data.Body+']');
     }
   });
 }

module.exports = router;
