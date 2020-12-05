#!/bin/bash
# PLEASE EXECUTE THIS SCRIPT FROM WITHIN THE ./INSTALL subfolder ##
base_dir=$PWD
USER = "freyrri"
if ! [[ "$PWD" =~ install ]]; then
    echo "Please execute this script only in the ./INSTALL sub-directory";
   exit 1; 
fi

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
# Create group for admin accounts who need full access to execute programs, all data and system files
sudo groupadd APIService
sudo gpasswd -a "$USER" APIService
sudo gpasswd -a labadmin APIService


## Install Express/node-js, npm 
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
#
#install dependencies
sudo npm install
# ----------------------------------------------------
## Install MongoDB Service                              mongo, use Membership, use devices, db.devices.find()
#
#  Use the following commands to stop and restart the service
#      sudo systemctl stop mongod.service
#      sudo systemctl restart mongod.service
#      mongod --version
# --------------------
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 656408E390CFB1F5
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt update
sudo apt install -y mongodb-org=4.4.1 mongodb-org-server=4.4.1 mongodb-org-shell=4.4.1 mongodb-org-mongos=4.4.1 mongodb-org-tools=4.4.1
#
sudo systemctl enable mongod.service
sudo systemctl start mongod.service
#
cd /opt/FitnesssCenterSrv
#
## ########################
## SAMBA
##  https://linuxconfig.org/how-to-configure-samba-server-share-on-ubuntu-18-04-bionic-beaver-linux
##  https://stackoverflow.com/questions/24933661/multiple-connections-to-a-server-or-shared-resource-by-the-same-user-using-more
##  https://devanswers.co/discover-ubuntu-machines-samba-shares-windows-10-network/
## https://www.digitalocean.com/community/tutorials/how-to-set-up-a-samba-share-for-a-small-organization-on-ubuntu-16-04
##
## net use * /delete.
## smbclient //localhost/MembersData -U fitnessUser
#
## Use SAMBA to share the MembrsData folder with the Fitness Center staff
## Create a group to hold the list of accounts that R/W to the shared drive: Uploads
#sudo groupadd sambashare
## add me to this group :-)
#sudo gpasswd -a "$USER" sambashare
## INSTALL SAMBA -
#cd /opt/FitnesssCenterSrv
#sudo apt-get install samba -y
#sudo mkdir BAK
#sudo cp /etc/samba/smb.conf ./BAK
#sudo -- bash -c 'echo "[MembersData]" >> /etc/samba/smb.conf'
#sudo -- bash -c 'echo "path = /opt/FitnessCenterSrv/MembersData" >> /etc/samba/smb.conf'
#sudo -- bash -c 'echo "available = yes" >> /etc/samba/smb.conf'
#sudo -- bash -c 'echo "guest ok = yes" >> /etc/samba/smb.conf'
#sudo -- bash -c 'echo "valid users = %S" >> /etc/samba/smb.conf'
#sudo -- bash -c 'echo "read only = no" >> /etc/samba/smb.conf'
#sudo -- bash -c 'echo "browsable = yes" >> /etc/samba/smb.conf'
#sudo -- bash -c 'echo "public = yes" >> /etc/samba/smb.conf'
#sudo -- bash -c 'echo "writable = yes" >> /etc/samba/smb.conf'
#
## Create the sub-folders 
#sudo mkdir -p /samba/share/MembersData
#sudo chmod 2777 /samba/share/MembersData
#sudo chgrp -hR sambashare /samba/share/MembersData
## Make all files in MembersData read-only but preserve the executable permission on the Directory only.
#sudo chmod -R a+rX /samba/share/MembersData/
#sudo setfacl -m default:group:sambashare:r-x /samba/share/MembersData/
#eval $"sudo cp $base_dir/smb.conf /etc/samba/" 
## load the default JSON files into the /MembersData
#eval $"sudo cp $base_dir/data.json /samba/share/MembersData/" 
#eval $"sudo cp $base_dir/locations.json /samba/share/MembersData/" 
#eval $"sudo cp $base_dir/checkins.json /samba/share/MembersData/" 
#eval $"sudo cp $base_dir/devices.json /samba/share/MembersData/" 
##
## Add "fitnessUser" as a new user in sambashare group  / do not create a Home dir, disable shell access for this user. 
## This use can now login to the shared drive.
#sudo useradd -M -d /samba/share/MembersData -s /usr/sbin/nologin -G sambashare fitnessUser
#pass=fitnessUser2020
#(echo "$pass"; echo "$pass") | sudo smbpasswd -s -a fitnessUser
#sudo smbpasswd -e fitnessUser
#sudo gpasswd -a fitnessUser sambashare
# START the SAMBA server
#sudo systemctl restart smbd nmbd
#
#
## ---------------------
## setup firewall
## ---------------------
sudo apt install ufw -y
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
# Restrict access to internal LAN and certain IP range
sudo ufw allow from 172.16.0.0/24 to any port ftp
sudo ufw allow from 172.16.0.0/24 to any port ssh
sudo ufw allow from 172.16.0.0/24 to any port 22 proto tcp
sudo ufw allow from 172.16.0.0/24 to any port 21 proto tcp
## deny SSH connections if an IP address attempts to initiate six or more connections within thirty seconds.
sudo ufw limit ssh/tcp comment 'Rate limit for openssh server'
sudo ufw allow 53
sudo ufw allow 8300/tcp comment 'no access from internet'  # This is the port we use for the Express/nodejs server
## The next few for Samba/wsdd:
##Ports 5357/tcp and 3702/udp need to be open for wsdd to run.
#sudo ufw allow 137/tcp
#sudo ufw allow 138/tcp
#sudo ufw allow 139/tcp
#sudo ufw allow 445/tcp
#sudo ufw allow 5357/tcp
#sudo ufw allow 3702/udp
#sudo ufw allow 'Samba'
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx HTTPS'
sudo ufw status verbose
#
sudo mkdir logs
## change ownership of these sub-folders accordinly
sudo chown -R root:APIService /opt/FitnessCenterSrv/logs
##
# Overall Ownership and permissions 
sudo chown -R root:APIService /opt/FitnessCenterSrv
find /opt/FitnessCenterSrv -type f -exec sudo chmod 0660 {} \;
sudo find /opt/FitnessCenterSrv -type d -exec sudo chmod 2770 {} \;
#
## Connect an existing network drive folder to the ~/mnt/share/FitnessCenter
## This will be used to pass membership data and check-in data from/to the clie$
#sudo apt-get install cifs-utils -y
#sudo mkdir /mnt/share/FitnessCenter
#sudo mount -t cifs -o username=<serviceAcct>,password=<serviceAcctPassw> //<se$
###  (alternate command)sudo mount.cifs //<servername>/data ~/mnt/share/Fitness$
#
#
## ---------------------
## setup NGINX (reverse-proxy)
## ---------------------
##
##  sudo tail -f /var/log/nginx/error.log
##  sudo tail -f /var/log/nginx/access.log     sudo tail -f ~/.pm2/pm2.log
##  sudo grep -r listen /etc/nginx/*
##
##  sudo systemctl restart nginx
##
## install the latest version of Nginx from the official repository
sudo wget --quiet http://nginx.org/keys/nginx_signing.key && sudo apt-key add nginx_signing.key
sudo apt install nginx -y
sudo rm /etc/nginx/sites-enabled/default
cd /etc/nginx/sites-available
eval $"sudo cp $base_dir/reverse-proxy.conf /etc/nginx/sites-available/"
eval $"sudo cp $base_dir/self-signed.conf /etc/nginx/snippets/" 
eval $"sudo cp $base_dir/ssl-params.conf /etc/nginx/snippets/" 
#
sudo sln -fs /etc/nginx/sites-available/reverse-proxy.conf /etc/nginx/sites-enabled/reverse-proxy.conf
sudo systemctl restart nginx
#
################################
# Install a process manager PM2
# A process manager for Node.js applications. PM2 makes it possibl$
# daemonize applications so that they will run in the background 
# as a service on server boots.
# 
#  See error log:   sudo tail -f ~/.pm2/pm2.log
#
sudo npm install pm2@latest -g
# now run the web server app as a background process
cd /opt/FitnessCenterSrv
sudo pm2 start pm2.start.config.js
pm2 startup systemd
#
#
echo "----------------------------------------------------------------------------------------"
echo "NOTE: make sure valid certificates (.cert + .key) files are found in the /sec/cert folder"
echo "Enter cert name changes in /etc/nginx/snippets/self-signed.conf"
echo "----------------------------------------------------------------------------------------"
#
#
#  ALLOW ACCESS:
#   use Membership
## switched to db Membership
# > use Membership
## list the current users
# > db.users.find()
# > db.users.find({"local.email"})
## List users that are pending activation
# > db.users.find({"local.active": false})
#
# Change the active flag for a specific user:
#
# > db.users.update({"local.email": "jrf1@cdc.gov"}, {$set: { "local.active": true }});
#
# Change the active flag for ALL users:
#
# > db.users.update({}, {$set: { "local.active": true }});
#
##  MEMBERS collection
##  display members
#   > db.members.find()
#
##  Update all active members to "inactive"
#   > db.members.update({"active": true }, {$set: { "active": false }}, {"multi": true});
#
##  Add the field "inactive" to all members which currenlty do not have that field. Also, set it to false as default.
#   > db.members.update({'active': {$exists : false}}, {$set: {'active': false}}, {multi: true})
#
#   > db.checkins.find()
#