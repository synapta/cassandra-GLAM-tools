var {Pool, Client} = require('pg');
  var DB = new Client({
        user: 'cassandra',
        host: '127.0.0.1',
        database: 'CassandraTEST',
        password: 'cassandra',
        port: 5432
      });

  exports.DB = DB;
 
 

