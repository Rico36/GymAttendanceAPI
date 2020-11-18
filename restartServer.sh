#run the web server app as a background process
cd /opt/FitnessCenterSrv
sudo pm2 stop app.js
sudo pm2 start app.js --watch --ignore-watch="[BAK, MembersData]" --name="Fitness Center App"
sudo pm2 startup systemd
sudo pm2 status
#