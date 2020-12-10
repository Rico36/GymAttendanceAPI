// PM2 - auto execute the server 
// run as:  C:> sudo pm2 start pm2.start.config.js
// To display errors:
// use:   sudo tail -f ~/.pm2/pm2.log
//
const pm2Config = {
    apps: [
      {
        name: 'Fitness Center API (OSSAM)',
        script: './app.js',
        exec_mode: 'cluster',
        instances: 1,
      },
    ],
  }
  
  module.exports = pm2Config
  