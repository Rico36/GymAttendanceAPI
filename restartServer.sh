#!/bin/bash
# STOP the API web server 
cd /opt/FitnessCenterSrv
#sudo service smbd stop
sudo pm2 stop app.js
sudo pm2 delete all

## Download all code changes from GIT and ignore/discard any local changes (if any)
# sudo git fetch --all
# sudo git reset --hard origin/master
sudo chmod +x restartServer.sh
sudo chmod +x stopServer.sh
sudo chmod +x serverStatus.sh

#sudo systemctl restart smbd nmbds
## Restart NGINX reverse-proxy
sudo systemctl reload nginx
## Restart PM2 but change the excutable user to www-data
sudo pm2 startup systemd  -u www-data --hp /home/www-data
#sudo pm2 start app.js --watch --ignore-watch="[BAK, logs, MembersData]" --name="Fitness Center App"
sudo pm2 start pm2.start.config.js
sudo pm2 save


