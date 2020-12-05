#!/bin/bash
# STOP the API web server 
cd /opt/FitnessCenterSrv
#sudo service smbd stop
sudo pm2 stop app.js
