var MariaClient = require('mariasql');
var { Pool, Client } = require('pg');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync("../config/config.json"));
var connectionToWMF = new MariaClient(config['wmflabs']);

var DBs = [];

config['categories'].forEach(element => {
  let db = {
    'name': element['name'],
    'fullname': element['fullname'],
    'category': element['category'],
    'image': element['image'],
    connection: new Client(element['connection'])
  };

  if (element.hasOwnProperty('http-auth')) {
    db['http-auth'] = element['http-auth'];
  }

  DBs.push(db);
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
exports.DBs = DBs;
