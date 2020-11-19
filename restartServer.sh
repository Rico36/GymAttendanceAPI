
# STOP the web server 
cd /opt/FitnessCenterSrv
sudo pm2 stop app.js

## Download all code changes from GIT and ignore/discard any local changes (if any)
# sudo git fetch --all
# sudo git reset --hard origin/master

#run the web server app as a background process
sudo pm2 start app.js --watch --ignore-watch="[BAK, MembersData]" --name="Fitness Center App"
sudo pm2 startup systemd
sudo pm2 status
#