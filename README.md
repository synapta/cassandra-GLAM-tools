The purpose of this project is to Support GLAMs in monitoring and evaluating
their cooperation with Wikimedia projects. Starting from a Wikimedia Commons
category this tool collects data about usage, views, contributors and topology
of the files inside.

## Init
Install nodejs dependencies:
```
npm install
```

Create a PostgreSQL database and a user. You can find the `CREATE` query in
`setup/SQL/db_create.sql`. Then you may need to update `config/categories.json`
 and `config/wmflabs.json`.

Finally run the table installation:
```
cd setup
node run.js
```

Install bower dependencies:
```
cd app/pages/assets
bower install
```

## Get data
Open the SSH tunnel to the WMF databases:
```
ssh -fN user@tools-dev.wmflabs.org -L 3306:itwiki.analytics.db.svc.eqiad.wmflabs:3306
```

Run the data gathering!
```
cd etl
./run.sh
```

## Run webservices
```
npm start
```
