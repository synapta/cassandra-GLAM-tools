var {Pool, Client} = require('pg');
  var DB = new Client({
        user: 'Cassandra',
        host: '127.0.0.1',
        database: 'CassandraTEST',
        password: 'Cassandra',
        port: 5432
      });

  exports.DB = DB;
 
 

