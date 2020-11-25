#!/bin/bash
# STOP the web server 
cd /opt/FitnessCenterSrv
sudo systemctl quit nginx
sudo service smbd stop
sudo pm2 stop app.js

## Download all code changes from GIT and ignore/discard any local changes (if any)
# sudo git fetch --all
# sudo git reset --hard origin/master
sudo chmod +x upload.php
sudo chmod +x restartServer.sh
sudo chmod +x stopServer.sh
sudo chmod +x serverStatus.sh
#run the web server app as a background process
sudo nginx -t
sudo systemctl start nginx
sudo pm2 start app.js --watch --ignore-watch="[BAK, MembersData]" --name="Fitness Center App"
sudo pm2 startup systemd
sudo systemctl status nginx
sudo pm2 status
#
sudo systemctl restart smbd nmbd
