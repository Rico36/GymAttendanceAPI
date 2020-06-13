var express = require('express');
var router = express.Router();
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

//
// '''''''''''''''''''''''''''''''''''''''
// GET request for the entire list of check-in 
// records currently stored.
// '''''''''''''''''''''''''''''''''''''''
router.get('/checkins', function (req, res, next) {
   const filePath = path.join(process.cwd(), '/data/data.txt');
   var fileName = "members-checkins.txt"; // The default name the browser will use

   fileName = fileName.split('.').join('-' + Date.now() + '.');
   try {
         res.download(filePath, fileName); 
   } catch (err) { console.error('GET error: '+ err);
                   res.end(); res.status(404).end() ; 
               }
});


// router.get('/checkins', function (req, res) {

//    try {
//       const filePath = path.join(process.cwd(), '/data/data.txt');
//       let destFileName = path.join(process.cwd(), '/data/checkins.txt');
//       debug ("Got a request for downloading the check-in(s) file.");  
//       debug('filePath=' + filePath);
//       var fileSizeInBytes = 0.0;
//       checkForFile(filePath, fileSizeInBytes);  // create the output data file only if it doesn't exist
//       if( fileSizeInBytes < 1.0)
//          debug( "File size is less thatn one megabyte" ) ;
//       else
//          debug( "File size is ~" + (fileSizeInBytes / 1000000.0 ) + ' MB(s) long.' ) ;

//      // append a date stamp to the file name
//      destFileName = destFileName.split('.').join('-' + Date.now() + '.');
//      fs.copyFile(filePath, destFileName, (err) => {
//          if (err) { throw (err);  } 
//          else {
//             console.log('Copied data.txt to destFileName: '+destFileName);
//          }
//      });
//      res.download(destFileName);
//     //  response.json('message: ok');

//    } catch (err) { console.error('GET error: '+ err); res.json('message: '+err); }

//  });  


// '''''''''''''''''''''''''''''''''''''''
// GET individual record by HHS-ID .              TBD: not implemented yet
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
// GET individual record by USER-ID .             TBD: not implemented yet
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
// Receive new check-in data from the field.
// '''''''''''''''''''''''''''''''''''''''
 router.post("/checkinData", (request,response) => {
   try {
         const filePath = path.join(process.cwd(), '/data/data.txt');
         debug ("Got a POST request with: "+ JSON.stringify(request.body));  
         debug('filePath=' + filePath);
         var fileSizeInBytes = 0.0;
         checkForFile(filePath, fileSizeInBytes);  // create the output data file only if it doesn't exist
         if( fileSizeInBytes < 1.0)
            debug( "File size is less thatn one megabyte (~" + (fileSizeInBytes / 1000000.0 ) + ' MB)' ) ;
         else
            debug( "File size is " + (fileSizeInBytes / 1000000.0 ) + ' MB(s) long.' ) ;

         // iterate through the incoming data to format it as comma separated (CSV)
         var arr = JSON.parse(JSON.stringify(request.body));
         var records = "";
         var cnt =0;
         for(var i = 0; i < arr.length; i++)
         {  cnt += 1;
         // userid, checkin date, lattitude, longitude
         records += arr[i].userid + ','+ arr[i].dt.trim() + ',' + arr[i].loc.lat + ','+ arr[i].loc.lng + os.EOL
         }
         // append data to file
         if( cnt > 0)
            fs.appendFile(filePath, records, 'utf8',
               function(err) { 
                  if (err) throw err;
                  // if no error
                  console.log(cnt +" new row(s) appended to file successfully.")
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
module.exports = router;
