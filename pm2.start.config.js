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
      watch: true,
      ignore_watch:  ["[\/\\]\./", "node_modules", "logs", "uploads", "BAK"],
      autorestart: true,
      max_restarts: 10,
      vizion: false,
      env: {
           "NODE_ENV": "development",
      },
      env_production : {
            "NODE_ENV": "production"
      }
    },
  ],
}

module.exports = pm2Config
