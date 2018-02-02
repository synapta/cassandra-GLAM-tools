var {Pool, Client} = require('pg');
  var DBs = [
    {
      name:"ZU",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'cassandradb',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"ETH",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'eth',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"SNL",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'snl',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"SBB",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'sbb',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"BUL",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'bul',
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
