The purpose of this project is to Support GLAMs in monitoring and evaluating
their cooperation with Wikimedia projects. Starting from a Wikimedia Commons
category this tool collects data about usage, views, contributors and topology
of the files inside.

The GLAM Statistical Tool "Cassandra" is a project of Wikimedia Switzerland (WMCH) and the result of a long-term collaboration with Swiss cultural institutions expressing their needs for measuring the impact of Wikimedia projects. Together with our GLAM Partner Network we went through the process of requirement engineering and the respective solution development with our IT-Partner Synapta. Since the first release in 2017, we have thoroughly and continuously enhanced Cassandra to the extraordinary tool it is today.

In keeping the spirit of the Wikimedia movement alive and supporting the mission to make cultural knowledge freely accessible to the world, we aim to share Cassandra for the benefit of other GLAM institutions across the globe. We have already started to implement the strategy of a global roll-out and will foster the implementation in late 2021 and from 2022 onwards.

If you are interested in adopting Cassandra in your country, please contact us at Wikimedia Switzerland.

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

To process the dates from the views chart, you can run:

```
cd etl
python3 run_views.py
```

To create the recommendation model, you need to download the Wikidata JSON dump and then run:

```
cd recommender
python3 model.py
```

To create the recommendations, you can run:

```
cd recommender
python3 run.py
```

## Run webservices

```
cd app
node server
```
