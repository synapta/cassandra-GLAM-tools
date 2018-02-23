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
    },
    {
      name:"SFA",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'sfa',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"CLS",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'cls',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"ZBZ",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'zbz',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"WMCH",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'wmch',
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
