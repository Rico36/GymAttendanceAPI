// -----------------------------------------------------
// Utility to replace the database with the content of data.json 
// CDC Wellness Check-in iOS app  v1.0
//
// Author: Ricky Freyre -  3/10/2020
// Note: This API can be hosted in Linux, FreeBSD, Windows and OS X. 
// 
// Global variables
const config = require('./config.json')
// Request path module for relative path
const path = require('path')
// Request File System Module
var fs = require('fs');
var os = require("os");
const LocationCacheFile = './install/data.json'; //  process.env.MEMBERS_DATA_FILE;

require("dotenv").config();
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

// Get Database table
var Member = require("./db/models/Member");
// get reference to database
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


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
// Replaces the entire database table "Members"
// with the content of a JSON file.
// '''''''''''''''''''''''''''''''''''''''
readFile( LocationCacheFile, main);

async function main (content) {
    let members;
    try {
        var cnt =0;
        members= JSON.parse(content);
        if( members.length > 0)
        { 
           var documentCount = await Member.countDocuments({});
           // erase the table :Member 
           await deleteAllData();

          console.log("Got a request to replace/restore the Members database out of a JSON file. "); // + JSON.stringify(request.body));  
          // iterate through the JSON records received but stored them as comma separated format (CVS)
          console.log( members.length + " rows will replace "+ documentCount + " in the database." );

          await insertMany(members);

        //   for( var i = 0,length = members.length; i < length; i++ ) {
        //       // read each member in file 
        //         cnt += 1;
        //         member = {};
        //         newMember = members[i];
        //         if (newMember.Firstname != null) {
        //            member.Firstname = newMember.Firstname;
        //          }
        //          if (newMember.Lastname != null) {
        //            member.Lastname = newMember.Lastname;
        //          }
        //          if (newMember.hhsid != null) {
        //            member.hhsid = newMember.hhsid;
        //           }
        //           if (newMember.userid != null) {
        //            member.userid = newMember.userid;
        //           }
        //            if (newMember.active != null) {
        //               member.active =newMember.active;
        //           }
        //           try {
        //                 //console.log(JSON.stringify(member));
        //                 Member.create(member, function (err, small) {
        //                     if (err) 
        //                         console.error(err);
        //                     else
        //                         console.log(member.userid + " saved to Member collection.");
        //                     // saved!
        //                     });
        //                 //user.save();
        //             //const addUser = await Member.set(member);  
        //            } catch (err) {
        //              const logger = log4js.getLogger('error');
        //              logger.info(`Adding/updating member ${member.userid} caught an error: `+err.message);
        //              console.log(`Adding/updating member ${member.userid} caught an error: `+err.message);
        //             }
        //         }
             }
             // Count rows in the table
             documentCount = await Member.countDocuments({});
             console.log(documentCount +" records(s) were inserted to the Member's table.");

        } catch (err) { 
                const logger = log4js.getLogger('error');
                logger.error(`Uploading ${LocationCacheFile} caugth an err: `+err);
                console.log(`Uploading ${LocationCacheFile} caugth an err: `+err);
        }
        process.exit();
  };
 

  // Utility - Read file content
  function readFile(filename, callback) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, 'utf8', function (err, data) {
            if (err) {
                reject(err)
                const logger = log4js.getLogger('error');
                logger.error(`Uploading ${config.membersData} caugth an err: `+err);
                console.log('readFile('+filename+') error:'+err);
                return callback(''); 
            } else {
                resolve(data);
                return callback(data);
            }
        });
    })
 }

 const deleteAllData = async () => {
    try {
      await Member.deleteMany();
      console.log('All Data successfully deleted');
    } catch (err) {
      console.log(err);
    }
  };

  // Insert many tweets, ignore any errors (ignores insertMany duplicate error)
async function insertMany(members) {
    try {
      await Member.insertMany(members, { ordered: false })
      } catch (e) {}
}

 