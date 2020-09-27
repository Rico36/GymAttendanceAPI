# GymAttendanceAPI
CDC fitness center attendance/checkin API - server


// -----------------------------------------------------------------------
//  Note:  to deploy to heroku from git repository:
//
//  1- Ceate a HEROKU account online, verify your email account, 
//  2- download and install the Heroku CLI for Windows 64-bit 
//       d:> npm install -g heroku
//       d:> heroku --version
//  3- make sure you also have installed git in windows.
//  4- open windows command or the VS Code terminal windows, and type these:
//  d:> cd d:\src\GymAttendanceAPI  (this is where your app resides)
//
//  d:> git init (Note: only if the git repo was not previously created)
//  d:> heroku login 
// IF THIS IS A NEW EMPTY APP YOU WANT TO LINK TO HEROKU, THEN DO THE FOLLOWING COMMAND:
//       d:> heroku create gym-attendance-api   (note: lowercase only. This creates a separate git repo for Heroku named: gym-attendance-api)
//       d:> git add .
//       d:> git commit -am "initial commit"
// OTHERWISE, MAKE SURE YOU ARE IN THE EXISTING APP'S SUB-FOLDER AND ENTER THE FOLLOWING COMMAND TO LINK THE EXISTING APP TO heorku's repo @ gym-attendance-api
//    d:> heroku git:remote -a gym-attendance-api
// DEPLOY CODE CHANGES TO HEROKU:
//  d:> git add .
//  d:> git commit -m "update commit"
//  d:> git push heroku master     (produced: https://gym-attendance-api.herokuapp.com/ )
//  d:> heroku open  
//
// NOTE: if you get this error==>  hint: Updates were rejected because the remote contains work that you do not have locally
//       try these: ( d:> git pull --rebase heroku master   and   d:> git push -f heroku master ) 
//
// ......................................................................
// If you are runnning tghe API from your own machine, set these env variables to allow access to the AWS Bucket and S3 files:
// to set environmental variables.  Using the heroku CLI, type:
//
//  c:> set AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXX AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//  c:> set S3_BUCKET=mybucket.freyre/input-files
//  c:> set OCD_API_KEY=30a4c59e59034c0695a7ddef172f0ecf
//
// If the API is rather deployed to the heroku server, issue these commands instead to set heroku env variables using the heroku CLI (see aws_config.json file for the keys):
//  d:> heroku config:set AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXX AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//  d:> heroku config:set S3_BUCKET=mybucket.freyre/input-files
//  d:> heroku config:set OCD_API_KEY=30a4c59e59034c0695a7ddef172f0ecf
// ......................................................................
//
//
//  NOTE: to stop the heroku server API use command:
//   heroku maintenance:off -a gym-attendance-api       
//   heroku ps:scale web=0 --app gym-attendance-api 
//  to restart the server do:
//   heroku maintenance:on -a gym-attendance-api 
//   heroku ps:scale web=1 --app gym-attendance-api 
// -----------------------------------------------------------------------
//  to update with a new version 
//    1) commit to git all code changes.  Use the vs code source control
//    2) git push heroku master 
// -----------------------------------------------------------------------
//  An interesting command: download a file from heroku 
//    example: download a file ./data/data.txt from heroku to a temp dir :
//    cd d:\src
//    del data.txt
//    heroku ps:copy ./data/data.txt --app gym-attendance-api
//    more data.txt  
//

