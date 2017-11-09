var MariaClient = require('mariasql');
var {Pool, Client} = require('pg');

var STARTING_CAT = "Historical_images_of_buildings_in_the_canton_of_Zürich";

var connectionToWMF = new MariaClient({
    host: '192.168.4.3',
    user: 'u3175',
    password: 'oolahaerohdeovei',
    db: 'commonswiki_p'
  });
  const storage=new Client({
    user: 'cassandra',
    host: '127.0.0.1',
    database: 'cassandradb',
    password: 'cassandra',
    port: 5432,
  });
 
  var SERVICE_USER = "test";
  var SERVICE_PASSWORD = "test";
  
  exports.SERVICE_USER = SERVICE_USER;
  exports.SERVICE_PASSWORD = SERVICE_PASSWORD;
  exports.connectionToWMF = connectionToWMF;
  exports.storage = storage;
  exports.STARTING_CAT=STARTING_CAT;

