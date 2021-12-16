# orca-ireland
orca-ireland

Developed using nodeJS servers, React frontend and Express backend. 
The Database is MongoDB, making it a MERN stack.
It's hosted on a Digital Ocean Droplet (Ubuntu VM) for $6 per month (this includes a faster CPU for extra $1).
This machine hosts both the frontend and backed servers on different ports. 
The database is alson located here. There is 25GB of storage on this droplet.

Server Setup Cheat Sheet

Pre installed with nodeJS, pm2 and git.

-- Git (from ../orca-ireland/
git clone https://github.com/kyleotoole91/orca-ireland.git
- update source
git fetch https://github.com/kyleotoole91/orca-ireland.git

-- Mongo
https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04-source
- Allow remote access (comma seperated binIp. Add IP of server) https://www.youtube.com/watch?v=sQhy63x9s3U
nano /etc/mongod.conf

--pm2 (service manager)
-start react app from project folder, name param is an arbitary alias
pm2 start --name uireact npm -- start
-save pm2 state for reboots
pm2 startup ubuntu

-- nginx 
- How to config proxies
nano /etc/nginx/sites-available/default
- after editing restart the service
- service nginx restart
- Add after server_name in server block for port 443. This will redirect www. to non www. to satisfy CORS policy for rest api
if ($host = www.orcaireland.com) {
  return 301 https://orcaireland.com$request_uri;
}

-- .env
In package.json, to start react on another port use:
-windows
"set PORT=X && react-scripts start"
-linux
"export PORT=X && react-scripts start"

https://gist.github.com/bradtraversy/cd90d1ed3c462fe3bddd11bf8953a896

https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal
/etc/letsencrypt/live/orcaireland.com
