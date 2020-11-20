# INSTALL ##
base_dir=$PWD
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
sudo chown root:freyrri /opt/FitnessCenterSrv
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
sudo -- bash -c 'echo "valid users = freyrri" >> /etc/samba/smb.conf'
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
sudo ufw allow 'Samba'
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx HTTPS'
sudo ufw status verbose
#
#
## Create the /MembersData sub-folder 
sudo mkdir MembersData
sudo chmod 0777 /opt/FitnesssCenterSrv/MembersData
## change owenership of the /MembersData sub-folder to me :-)
sudo chown freyrri:www-data /opt/FitnessCenterSrv/MembersData
eval $"sudo cp $base_dir/data.json /opt/FitnessCenterSrv/MembersData/" 
eval $"sudo cp $base_dir/locations.json /opt/FitnessCenterSrv/MembersData/" 
eval $"sudo cp $base_dir/checkins.json /opt/FitnessCenterSrv/MembersData/" 
eval $"sudo cp $base_dir/devices.json /opt/FitnessCenterSrv/MembersData/" 
## Give ownership of the server to the www-data user
sudo chown www-data:www-data /opt/FitnessCenterSrv/
sudo chmod g+w /opt/FitnessCenterSrv/
#
#
# START the SAMBA server
sudo service smbd restart
sudo systemctl restart nmbd
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
echo "NOTE: make sure valid certificates (.cert + .key) files are found in the /sec/cert folder"
echo "Enter cert name changes in /etc/nginx/snippets/self-signed.conf"
#Optionally, run the web server app manually
#cd /opt/FitnessCenterSrv
#npm start
