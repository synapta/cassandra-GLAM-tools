var Client = require('mariasql');
var MongoClient = require('mongodb').MongoClient;

var c = new Client({
  host: '127.0.0.1',
  user: 'u3175',
  password: 'oolahaerohdeovei',
  db: 'commonswiki_p'
});

var q = "SELECT * \
FROM imagelinks \
WHERE il_to = 'Filippo_Mordani.jpg'"

var url = 'mongodb://localhost:27017/cassandra';
MongoClient.connect(url, function(err, db) {
  console.log("Connected correctly to server");
  var collection = db.collection('documents');

  c.query(q, function(err, rows) {
    if (err)
    throw err;
    console.dir(rows);

    collection.insertMany(rows, function(err, result) { console.log(result) });
    c.end();
  });  
});
