# orca-ireland
orca-ireland

https://orcaireland.com/

Developed using NodeJS, React and Express. 
The Database is MongoDB, making it a MERN stack.
It's hosted on a Digital Ocean Droplet (Ubuntu Ubuntu 20.04.2 LTS VM) for $6 per month (this includes a faster CPU for extra $1).
This droplet hosts both the frontend and backed servers. 
The database is hosted on this server, but it is not accessible publicly. 
Nginx is used to route requests to the secured SSL ports. It also redirects www. requests to non www.
There is 25GB of storage on this droplet.

Server Setup Cheat Sheet

Pre installed with nodeJS, pm2 and git.

-- Git (from ../orca-ireland/
git clone https://github.com/kyleotoole91/orca-ireland.git
- update source
git fetch https://github.com/kyleotoole91/orca-ireland.git

-- Mongo
https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04-source
- Allow remote connections (comma seperated binIp. Allow access by adding Add IP of server) 
nano /etc/mongod.conf

--pm2 (service manager)
-start react app from project folder, name param is an arbitary alias
pm2 start --name uireact npm -- start
-save pm2 state for reboots
pm2 startup ubuntu

-- nginx 
- Config proxies
nano /etc/nginx/sites-available/default
- Add after server_name in server block for port 443. This will redirect www. to non www. to satisfy CORS policy for rest api
if ($host = www.orcaireland.com) {
  return 301 https://orcaireland.com$request_uri;
}
- restart the service so changes take effect: service nginx restart

-- .env
In package.json, to start the react app on desired port use:
-windows
"set PORT=X && react-scripts start"
-linux
"export PORT=X && react-scripts start"

https://gist.github.com/bradtraversy/cd90d1ed3c462fe3bddd11bf8953a896

https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal
/etc/letsencrypt/live/orcaireland.com
