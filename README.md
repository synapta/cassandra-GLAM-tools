The purpose of this project is to Support GLAMs in monitoring and evaluating
their cooperation with Wikimedia projects. Starting from a Wikimedia Commons
category this tool collects data about usage, views, contributors and topology
of the files inside.

## Installation

Install Node.js project dependencies:

```
npm install
```

Install Python dependencies:

```
pip3 install -r requirements.txt
```

Copy the file `config/config.example.json` to `config/config.json` and modify it as required.

The provided MongoDB collection must contain documents with the following format:

```
{
   "name": "ETH",
   "fullname": "ETH Library of Zurich",
   "category": "Media contributed by the ETH-Bibliothek",
   "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Aettenschwil_1953.jpg/640px-Aettenschwil_1953.jpg",
   "database": "eth",
   "http-auth": {
      "username": "eth",
      "password": "PASSWORD"
   }
}
```

The field `http-auth` is optional and may be omitted if no password is required.

## Get data

Create the file `.ssh/config`:

```
Host wmflabs
   HostName      tools-dev.wmflabs.org
   User          <user>
   Port          22
   IdentityFile  ~/.ssh/<key>
   LocalForward  3306 itwiki.analytics.db.svc.eqiad.wmflabs:3306
```

Open the SSH tunnel to the WMF databases:

```
autossh -f -N wmflabs
```

Create a systemd service unit to auto-launch autossh (optional):

```
[Unit]
Description=AutoSSH for stats.wikimedia.swiss database.
 
[Service]
User=<user>
Group=<user>
ExecStart=/usr/bin/autossh -N wmflabs
 
[Install]
WantedBy=multi-user.target
```

Run the data gathering periodically (e.g., every 15 minutes).

```
cd etl
python3 run.py
```

If some dates are missing from the views chart, you can process them again.

```
cd etl
python3 fix_views.py
```

## Run webservices

```
cd app
node server
```

## Run with Docker

Create a new Docker image:

```
sudo docker image build -t glam .
```

Install Node.js project dependencies:

```
sudo docker run -v "$PWD":/src -w /src glam npm install
```

Run the server:

```
sudo docker run -d --name glam_app --net=host -v "$PWD":/src -w /src/app glam node server.js
```

Show the logs:

```
sudo docker logs --follow glam_app
```

Manage the server:

```
sudo docker [start|stop|restart] glam_app
```
