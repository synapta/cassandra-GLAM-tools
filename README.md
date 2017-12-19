## Init
Install nodejs dependencies:
```
npm install
```

Create a PostgreSQL database and a user. You can find the `CREATE` query in
`setup/SQL/db_create.sql`. Then you need to update `setup/config.js`.

Finally run the table installation:
```
cd setup
node run.js
```

## Get data
Open the SSH tunnel to the WMF databases:
```
ssh -fN user@tools-dev.wmflabs.org -L 3306:itwiki.analytics.db.svc.eqiad.wmflabs:3306
```

Config the `STARTING_CAT` in `etl/config.js`.

Run the data gathering!
```
cd etl
./run.sh
```

## Run webservices
```
cd app
npm start
```
