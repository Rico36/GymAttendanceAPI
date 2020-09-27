// NOTE: This file (.JS) is not meant to be compiled nor stored in github.  It is only for dev tests/experiment
//
// Create these rather as environmental variables in heroku.  Use the heroku CLI and type:
//
//  heroku config:set AWS_ACCESS_KEY_ID=AKIAILJNEBY3DOVEM33Q AWS_SECRET_ACCESS_KEY=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
//  heroku config:set S3_BUCKET=mybucket.freyre/input-files
//  heroku config:set OCD_API_KEY=30a4c59e59034c0695a7ddef172f0ecf
//
//
//  npm install opencage-api-client
//  npm install geolib
//
// ....................
// to run this test script:
//  X:> node test.js 
//
const geolib = require('geolib');
const opencage = require('opencage-api-client');
// Global variables
// Request path module for relative path
const path = require('path')
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// 
AWS.config.loadFromPath('./aws_config.json'); 
// Set the Region 
AWS.config.update({region: 'us-east-1'});
// AWS S3 bucket we will use to save new checkins
//const S3_BUCKET = process.env.S3_BUCKET; 
const S3_BUCKET = 'mybucket.freyre/input-files';

// Create S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Request File System Module
var fs = require('fs');
const { response } = require('express');
var done=false;
const params = {Bucket: S3_BUCKET, Key: 'locations.json'};  // read content of S3 file
const S3LocationCacheFile = 'locations.json';
var locations=null;


// .......................................................................
// Download the locations cache from S3 before processing
// .......................................................................
//downloadFile(S3LocationCacheFile, './data/locations.json', main);  // download to ephemeral disk
readFile( S3LocationCacheFile, main);

async function main (content) {
    // var content = fs.readFileSync('./data/locations.json', 'utf8');
    try {
         locations= JSON.parse(content);
    } catch (err) {
        if (locations == undefined)  {   // const json = '[{"lat": 1, "lng": 1, "loc":"dummy" }]'; // initialize the array
            const json = '[{"lat":1,"lng":1,"loc":"dummy"},{"lat":33.81953988761112,"lng":-84.37508112061631,"loc":"30305-PalmourDrive-718"},{"lat":34.051754953553264,"lng":-84.21665015622862,"loc":"30022-AgateDrive-4886"}]'; 
            locations = JSON.parse(json);
            console.log('Locations was initialized with default values.');
        }
    }
    //console.log('Locations= '+ JSON.stringify(locations));

    // .............
    // LOOP IMPLIED HERE FOR EACH CHECKIN RECORD
    // .................
    try {
      const filename = 'checkins.json' 
      // iterate through the JSON records received (i.e., request.body) and store trxs as comma separated (CVS)
      var records=''; // get current checkins records held in S3 storage (AWS)
      readFile(filename, function(response) {
         // get current checkins records held in S3 storage (AWS)
       //  records = ''+response;  // <<== all rows  
        response ='['+response.slice(0, -2) + ']';   // <<== all rows  
        records = JSON.parse(response);
      //   console.log('records: '+ JSON.stringify(records));
         var cnt =0;
         //var keys = Object.keys( records );
         console.log ( 'checkin records='+ records.length);
         for( var i = 0,length = records.length; i < length; i++ ) {
            // var lat= 33.81953988761112, lng= -84.37508112061632;
            // var lat= 34.051754953553264, lng= -84.21665015622862;
            //var lat = 34.05173565446701, lng = -84.21665574720302;
            var lat = records[ i ].lat;
            var lng = records[ i ].lng;
          
            doThis(lat, lng, processResult);
            cnt =i;
          } // finish loop
         
         console.log(cnt +' records(s) processed from S3');
       });

   } catch (err) { console.error('error: '+ err) }

   console.log('Locations= '+ JSON.stringify(locations));
  }


  processResult = (place) => {
   // console.log('Locations= '+ JSON.stringify(locations));
    console.log(`processResult() => coordinates are within ~${place.distance} meter(s) from ${place.location}`);
  }
// END

// .......................................................................
// Compute a place description string that represent the given coords
// .......................................................................
//
async function doThis (lat, lng, callback)  {  
    var nearestLocation = geolib.findNearest({ latitude: lat, longitude: lng }, locations);
    place = nearestLocation.loc;
   // console.log ('nearestLocation: ' + JSON.stringify(nearestLocation));
    distance = geolib.getDistance({ latitude: lat, longitude: lng }, { latitude: nearestLocation.lat, longitude: nearestLocation.lng }, accuracy = 1);
    console.log(`place: ${place} lat: ${nearestLocation.lat}  lng: ${nearestLocation.lng} ==> lat: ${lat}  lng: ${lng}   distance=${distance} `);
    if( distance >9) {  
          location=null;
          // go ahead and make a call to the opencage's API to resolve the coords and get nearest location
          await opencage.geocode({q: `${lat}, ${lng}`, language: 'us'}).then(data => {
                console.log('opencage.geocode API data.status.code =' + data.status.code );
                if (data.status.code == 200) {
                  var nearest = data.results[0];
                  place = nearest.components.postcode+'-'+nearest.components.road.replace(/\s/g, "") +'-'+ nearest.components.house_number;
                  location = { lat: lat, lng: lng, loc: place }; 
                  console.log('added a new row to the im-mem cache of locations: '+ place);
                  locations.push(location);                  
                  nearestLocation = geolib.findNearest({ latitude: lat, longitude: lng }, locations);
                  distance = geolib.getDistance({ latitude: lat, longitude: lng }, nearestLocation, accuracy = 1);
                  //  console.log('locations: '+ JSON.stringify(locations)); 
                } else { console.log(`API failed with code: ${data.status.code} / place defaults to: unknown`); place='unknown';}        
          });
    }
    // console.log(`coordinates are within ~${distance} meter(s) distance of ${place}`);
    return callback ({location: place, distance: distance});
  };


 // read S3 File function
 function readFile(filename, callback) {
    const getParams = {Bucket: S3_BUCKET, Key: filename};  
    //console.log (`preparing to read data from S3...${S3_BUCKET}`);
    var data=null;
    s3.getObject(getParams, function(err, data) {
      if (err){
         console.log('readFile('+filename+') error:'+err);
         return callback(''); // res.status(400).send({success:false,err:err});
      }
      else{
       // console.log('readFile('+filename+') returned:'+data.Body);
       done=true;
       return callback(data.Body);
      }
    });
  };
 

// --------------------------------------------------------------------------------------------------------------
// Retrieve a file from AWS S3 bucket   i.e., S3File ='checkins.json'   
function downloadFile(S3File, targetName, callback){
 console.log (`Downloading location data from S3...${S3_BUCKET}`);
 const putParams = {
   Bucket      : S3_BUCKET,
   Key         : S3File
 };
 s3.getObject(putParams,  function(err, data) {
 if(err) {
   console.log('download err: ' + err);
   const json = '[{"lat": 1, "lng": 1, "loc":"dummy" }]';
   writeFile(path.join(__dirname, targetName), json);
 }
 else 
 // stream this file to stdout
   try {
     let readStream = s3.getObject(putParams).createReadStream();
     let writeStream = fs.createWriteStream(path.join(__dirname, targetName));
     readStream.pipe(writeStream);
     console.log('File Downloaded!');
     } catch (err) { console.log( ' downloading location file from S3 error: ', err); throw err; }
   })
   callback();
};

// Save data to ephemeral storage (as a file to temporary disk)
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
// checks if the file exists. 
 // If it doesn't, then the file is created.
 function checkForFile(filepath, fileSizeInBytes)
 {
     fileSizeInBytes = 0.0;
     fs.exists(filepath, function (exists) {
         if(exists) {
            var stats = fs.statSync(filepath)  // otherwise, return current file size
            fileSizeInBytes = stats["size"];
         }
     });
 }
