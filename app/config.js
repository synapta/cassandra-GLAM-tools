var { Pool, Client } = require('pg');
var fs = require('fs');

var categories = JSON.parse(fs.readFileSync("../config/categories.json"));

var DBs = [];

categories.forEach(element => {
  let db = {
    'name': element['name'],
    'fullname': element['fullname'],
    'category': "Category:" + element['category'],
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

exports.DBs = DBs;
exports.getIndexOfDb = getIndexOfDb;
