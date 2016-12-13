var Client = require('mariasql');
var MongoClient = require('mongodb').MongoClient;
var config = require('./config.js');

var connectionToWMF = new Client({
  host: '127.0.0.1',
  user: 'u3175',
  password: 'oolahaerohdeovei',
  db: 'commonswiki_p'
});

var DB_NAME = "ETH";
var STARTING_CAT = "Media_contributed_by_the_ETH-Bibliothek";

var currentFather = STARTING_CAT;
var findCatChildren = "SELECT page_title \
                       FROM categorylinks, page \
                       WHERE cl_to = " + currentFather + " \
                       AND page_id = cl_from \
                       AND page_namespace = 14"

var url = 'mongodb://localhost:27017/' + DB_NAME;
MongoClient.connect(url, function(err, db) {
  console.log("Connected correctly to server");
  var collection = db.collection('documents');

  connectionToWMF.query(q, function(err, rows) {
    if (err)
    throw err;
    console.dir(rows);

    collection.insertMany(rows, function(err, result) { console.log(result) });
    connectionToWMF.end();
  });
});
