#!/bin/bash
# STOP the web server 
cd /opt/FitnessCenterSrv
sudo systemctl quit nginx
sudo service smbd stop
sudo pm2 stop app.js
