# GymAttendanceAPI
CDC fitness center attendance/checkin API - server

/ .........................
// TO CREATE A NEW NODE EXPRESS APP
// https://expressjs.com/en/starter/generator.html
// .........................
 Use the application generator tool, express-generator, to quickly create an application skeleton.
 You can run the application generator with the npx command (available in Node.js 8.2.0):

  d:> npx express-generator
  
 the following creates an Express app named GymAttendanceAPI:
  d:> express GymAttendanceAPI

 Then install dependencies:
  d:> cd GymAttendanceAPI
  d:> npm install
  d:> set DEBUG=GymAttendanceAPI:* & npm start  (on Windows command prompt)
 or
  PS> $env:DEBUG='GymAttendanceAPI:*'; npm start    (on Windows Powershell)

  Then load http://localhost:3000/ in your browser to access the app.
  or type:  code .   (to run VS Code)

 git + deployment instructions: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/deployment
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------

