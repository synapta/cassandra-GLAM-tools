var MongoClient = require('mongodb').MongoClient;
var MariaClient = require('mariasql');
var { Pool, Client } = require('pg');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync("../config/config.json"));
var connectionToWMF = new MariaClient(config['wmflabs']);

var DBs = [];

var client = new MongoClient(config['mongodb']['url'], { useNewUrlParser: true });

client.connect(function(err) {
  var db = client.db(config['mongodb']['database']);
  var collection = db.collection(config['mongodb']['collection']);

  collection.find({}).toArray(function(err, docs) {
    docs.forEach(function(element) {
      let cat = {
        'name': element['name'],
        'fullname': element['fullname'],
        'category': element['category'],
        'image': element['image'],
        connection: new Client({
          'user': config['postgres']['user'],
          'password': config['postgres']['password'],
          'host': config['postgres']['hos'],
          'port': config['postgres']['port'],
          'database': element['database']
        })
      };
    
      if (element.hasOwnProperty('http-auth')) {
        cat['http-auth'] = element['http-auth'];
        cat['http-auth']['realm'] = element['name'] + " stats";
      }
    
      DBs.push(cat);
    });
    exports.DBs = DBs;
    client.close();
  });
});

function getIndexOfDb(id, arr) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i].name === id)
      break;
    i++;
  }
  if (i === arr.length)
    i = -1;
  return i;
}

exports.getIndexOfDb = getIndexOfDb;
exports.connectionToWMF = connectionToWMF;
