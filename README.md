The purpose of this project is to Support GLAMs in monitoring and evaluating
their cooperation with Wikimedia projects. Starting from a Wikimedia Commons
category this tool collects data about usage, views, contributors and topology
of the files inside.

## Installation
Please note that the supported Node.js version is 11.

Install Node.js global dependencies:
```
sudo npm install -g bower
```

Install Node.js project dependencies:
```
npm install
```

Install Python dependencies:
```
pip3 install -r requirements.txt
```

Install Bower dependencies:
```
cd app/pages/assets
bower install
```

Copy the file `config/config.example.json` to `config/config.json` and modify as required.

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
nodejs server
```
