var {Pool, Client} = require('pg');
  var DBs = [
    {
      name:"cassandra",
      connection:new Client({
        user: 'cassandra',
        host: '127.0.0.1',
        database: 'cassandradb',
        password: 'cassandra',
        port: 5432
      })
    }   
  ];
  var SERVICE_USER = "test";
  var SERVICE_PASSWORD = "test";
  
  exports.DBs = DBs;
  exports.SERVICE_USER = SERVICE_USER;
  exports.SERVICE_PASSWORD = SERVICE_PASSWORD;
 

