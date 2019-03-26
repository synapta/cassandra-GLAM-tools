The purpose of this project is to Support GLAMs in monitoring and evaluating
their cooperation with Wikimedia projects. Starting from a Wikimedia Commons
category this tool collects data about usage, views, contributors and topology
of the files inside.

## Init
Install nodejs dependencies:
```
npm install
```

Install bower dependencies:
```
cd app/pages/assets
bower install
```

Update the configuration file: `config/config.json`.

The provided MongoDB collection must contain documents with the following format:
```
{
   "name":"ETH",
   "fullname":"ETH Library of Zurich",
   "category":"Media contributed by the ETH-Bibliothek",
   "image":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Aettenschwil_1953.jpg/640px-Aettenschwil_1953.jpg",
   "database":"eth",
   "http-auth":{
      "username":"eth",
      "password":"PASSWORD"
   }
}
```

The field `http-auth` is optional and may be omitted if no password is required.

## Get data
Open the SSH tunnel to the WMF databases:
```
autossh -Nf -L 3306:itwiki.analytics.db.svc.eqiad.wmflabs:3306 user@tools-dev.wmflabs.org
```

Run the data gathering!
```
cd etl
python3 run.py
```

## Run webservices
```
npm start
```
