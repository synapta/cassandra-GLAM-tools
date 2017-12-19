var {Pool, Client} = require('pg');
  var DB = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'cassandradb',
        password: 'postgres',
        port: 5432
      });

  exports.DB = DB;
