var MariaClient = require('mariasql');
var { Pool, Client } = require('pg');
var fs = require('fs');

var wmflabs = fs.readFileSync("../config/wmflabs.json");
var connectionToWMF = new MariaClient(JSON.parse(wmflabs));

var categories = JSON.parse(fs.readFileSync("../config/categories.json"));

var DBs = [];

categories.forEach(element => {
  let db = {
    'name': element['name'],
    'fullname': element['fullname'],
    'category': element['category'],
    connection: new Client(element['connection'])
  };
  DBs.push(db);
});

exports.connectionToWMF = connectionToWMF;
exports.DBs = DBs;
