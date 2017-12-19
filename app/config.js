var {Pool, Client} = require('pg');
  var DBs = [
    {
      name:"cassandradb",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'cassandradb',
        password: 'postgres',
        port: 5432
      })
    }
  ];
  var SERVICE_USER = "test";
  var SERVICE_PASSWORD = "test";

  exports.DBs = DBs;
  exports.SERVICE_USER = SERVICE_USER;
  exports.SERVICE_PASSWORD = SERVICE_PASSWORD;
