#!/bin/bash
# INSTALL ##
base_dir=$PWD
USER = "freyrri"
##
#install oracle java
#sudo add-apt-repository ppa:webupd8team/java
#sudo apt-get update
#sudo apt-get install oracle-java7-installer
##  -----
## Install thee node js repo first
cd ~
curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
## Install Git
sudo apt-get install git
##
## Create an application folder following good Linux convention and owned by ROOT, not the user.
## The folder /Opt is reserved by Linux for additional software we little humans may install. 
## This is kind of like ‘Program Files’ for linux.
sudo mkdir /opt/FitnessCenterSrv
## Create a group to hold the list of accounts that can access the shared drives in SAMBA
sudo groupadd sambashare
# Create group for admin accounts who need full access to all data and system files
sudo groupadd APIService
## add me to these groups :-)
sudo gpasswd -a "$USER" sambashare
sudo gpasswd -a "$USER" APIService
sudo gpasswd -a labadmin APIService


## Install node-js, npm 
sudo apt-get update && apt-get -y upgrade
cd /opt/FitnesssCenterSrv
sudo apt install nodejs  -y
nodejs -v
##sudo apt-get install -y build-essential
npm --version
sudo npm install express --save -y

#download the Express/Node.JS application code from my Git repository
cd /opt/FitnesssCenterSrv
sudo git init
sudo git remote add origin https://github.com/Rico36/GymAttendanceAPI.git
sudo git config --global user.name "Rico36"
sudo git config --global user.email "ricky.freyre@gmail.com"
sudo git config --global push.default "matching"
sudo git config --global branch.autosetuprebase always
sudo git config --global color.status auto
sudo git config --global color.branch auto
sudo git fetch --all
sudo git reset --hard origin/master
#git pull
#install dependencies
npm install
#
## Use SAMBA to share the MembrsData folder with the Fitness Center staff
# INSTALL SAMBA -
sudo cd /opt/FitnesssCenterSrv
sudo apt-get install samba -y
sudo mkdir BAK
sudo cp /etc/samba/smb.conf ./BAK
sudo -- bash -c 'echo "[MembersData]" >> /etc/samba/smb.conf'
sudo -- bash -c 'echo "path = /opt/FitnessCenterSrv/MembersData" >> /etc/samba/smb.conf'
sudo -- bash -c 'echo "available = yes" >> /etc/samba/smb.conf'
sudo -- bash -c 'echo "guest ok = yes" >> /etc/samba/smb.conf'
sudo -- bash -c 'echo "valid users = %S" >> /etc/samba/smb.conf'
sudo -- bash -c 'echo "read only = no" >> /etc/samba/smb.conf'
sudo -- bash -c 'echo "browsable = yes" >> /etc/samba/smb.conf'
sudo -- bash -c 'echo "public = yes" >> /etc/samba/smb.conf'
sudo -- bash -c 'echo "writable = yes" >> /etc/samba/smb.conf'
##
## setup firewall
sudo apt install ufw -y
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ftp
sudo ufw allow 53
sudo ufw allow ssh
sudo ufw allow 22
sudo ufw allow 8300/tcp
##Ports 5357/tcp and 3702/udp need to be open for wsdd to run.
sudo ufw allow 137/tcp
sudo ufw allow 138/tcp
sudo ufw allow 139/tcp
sudo ufw allow 445/tcp
sudo ufw allow 5357/tcp
sudo ufw allow 3702/udp
sudo ufw allow 'Samba'
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx HTTPS'
sudo ufw status verbose
#
#
## Create the sub-folders 
sudo mkdir MembersData
sudo mkdir Uploads
sudo mkdir logs
sudo chmod 2777 /opt/FitnesssCenterSrv/MembersData
## load the default JSON files into the /MembersData
eval $"sudo cp $base_dir/data.json /opt/FitnessCenterSrv/MembersData/" 
eval $"sudo cp $base_dir/locations.json /opt/FitnessCenterSrv/MembersData/" 
eval $"sudo cp $base_dir/checkins.json /opt/FitnessCenterSrv/MembersData/" 
eval $"sudo cp $base_dir/devices.json /opt/FitnessCenterSrv/MembersData/" 
## change ownership of these sub-folders accordinly
sudo chown -R root:APIService /opt/FitnessCenterSrv/Uploads
sudo chown -R root:APIService /opt/FitnessCenterSrv/logs
sudo chown -R root:APIService /opt/FitnessCenterSrv/MembersData

## ########################
## SAMBA
##  https://linuxconfig.org/how-to-configure-samba-server-share-on-ubuntu-18-04-bionic-beaver-linux
##  https://stackoverflow.com/questions/24933661/multiple-connections-to-a-server-or-shared-resource-by-the-same-user-using-more
##  https://devanswers.co/discover-ubuntu-machines-samba-shares-windows-10-network/
## https://www.digitalocean.com/community/tutorials/how-to-set-up-a-samba-share-for-a-small-organization-on-ubuntu-16-04
##
## Add "fitnessUser" as a new user in sambashare group  / do not create a Home dir, disable shell access for this user. 
## This use can now login to the shared drive.
sudo useradd -M -d /opt/FitnessCenterSrv/MembersData -s /usr/sbin/nologin -G sambashare fitnessUser
pass=fitnessUser2020
(echo "$pass"; echo "$pass") | sudo smbpasswd -s -a fitnessUser
sudo smbpasswd -e fitnessUser
sudo gpasswd -a fitnessUser APIService
#   
# Ownership and permissions 
sudo chown -R root:APIService /opt/FitnessCenterSrv
## Change group membership of all files in MembersData to APIService  
sudo chgrp -hR APIService /opt/FitnessCenterSrv/MembersData
## Change group membership of all files in Uploads to sambashare  
sudo chgrp -hR sambashare /opt/FitnessCenterSrv/Uploads
## Change permissions to read and write in the /Uploads folder for sambashare users
sudo setfacl -m group:sambashare:rwx /opt/FitnessCenterSrv/Uploads/
## Change permissions to read only in the /MembersData folder for sambashare users
##sudo setfacl -m group:sambashare:r-x /opt/FitnessCenterSrv/MembersData/
find /opt/FitnessCenterSrv -type f -exec chmod 0660 {} \;
sudo find /opt/FitnessCenterSrv -type d -exec chmod 2770 {} \;
# Make all files in MembersData read-only but preserve the executable permission on the Directory only.
sudo chmod -R a+rX /opt/FitnessCenterSrv/MembersData/
sudo chmod -R a+wX /opt/FitnessCenterSrv/Uploads/

# START the SAMBA server
sudo systemctl restart smbd nmbd
#
#
## Connect an existing network drive folder to the ~/mnt/share/FitnessCenter
## This will be used to pass membership data and check-in data from/to the clie$
#sudo apt-get install cifs-utils -y
#sudo mkdir /mnt/share/FitnessCenter
#sudo mount -t cifs -o username=<serviceAcct>,password=<serviceAcctPassw> //<se$
###  (alternate command)sudo mount.cifs //<servername>/data ~/mnt/share/Fitness$
#
#
## install the latest version of Nginx from the official repository
sudo wget --quiet http://nginx.org/keys/nginx_signing.key && sudo apt-key add nginx_signing.key
sudo apt install nginx -y
sudo rm /etc/nginx/sites-enabled/default
cd /etc/nginx/sites-available
eval $"sudo cp $base_dir/reverse-proxy.conf /etc/nginx/sites-available/"
eval $"sudo cp $base_dir/self-signed.conf /etc/nginx/snippets/" 
eval $"sudo cp $base_dir/ssl-params.conf /etc/nginx/snippets/" 

sudo sln -fs /etc/nginx/sites-available/reverse-proxy.conf /etc/nginx/sites-enabled/reverse-proxy.conf
sudo systemctl restart nginx
#
#
# Install a process manager PM2
# A process manager for Node.js applications. PM2 makes it possibl$
# daemonize applications so that they will run in the background 
# as a service on server boots.
sudo npm install pm2@latest -g
#run the web server app as a background process
cd /opt/FitnessCenterSrv
pm2 start app.js --watch --ignore-watch="[node_modules, MembersData]" --name="Fitness Center App"
pm2 startup systemd
#
#
echo "----------------------------------------------------------------------------------------"
echo "NOTE: make sure valid certificates (.cert + .key) files are found in the /sec/cert folder"
echo "Enter cert name changes in /etc/nginx/snippets/self-signed.conf"
echo "----------------------------------------------------------------------------------------"
#Optionally, run the web server app manually
#cd /opt/FitnessCenterSrv
#npm start
