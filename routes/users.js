var express = require('express');
var router = express.Router();
// Global variables
// Request path module for relative path
const path = require('path')
// Request File System Module
var fs = require('fs');

var debug = require('debug')('users');

// Read the entore list of regstered users into memory
var users =  JSON.parse(fs.readFileSync('./data/MOCK_DATA.json', 'utf8'));

// -----------------------------------------------------------------------
//  Note:  to deploy to heroku from git repository:
//
//  1- Ceate a HEROKU account online, verify your email account, 
//  2- downloaad and install the Heroku CLI for Windows 64-bit 
//  3- make sure you also have install git in windows.
//  4- open a cmd windows, type:
//  cd d:\src
//  heroku login 
//  heroku create gym-attendance-api
//  cd GymAttendanceAPI
//  git init
//  heroku git:remote -a GymAttendanceAPI
//  git add .
//  git commit -am "initial commit"
//  git push heroku master
// -----------------------------------------------------------------------

// '''''''''''''''''''''''''''''''''''''''
// GET request for the /list_user page.
// '''''''''''''''''''''''''''''''''''''''
router.get('/', function (req, res) {

    debug ("Got a GET request for list of users");
    
    /* Just send the file as JSON*/
    res.send(users);
  });  



// '''''''''''''''''''''''''''''''''''''''
// GET record by HHS-ID .
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
// GET record by USER-ID .
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
// POST check-in data.
// '''''''''''''''''''''''''''''''''''''''
router.post("/checkinData", (request,response) => {
   try {
         debug ("Got a POST request with: "+ JSON.stringify(request.body));
         response.json('message: ok');

      } catch (err) { console.error('POST error: '+ err); response.json('message: '+err); }
     
 });


module.exports = router;
