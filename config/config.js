var MongoClient = require('mongodb').MongoClient;
var MariaClient = require('mariasql');
var { Pool, Client } = require('pg');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync("../config/config.json"));
exports.connectionToWMF = new MariaClient(config['wmflabs']);

config.admin['realm'] = 'Admin area';
exports.admin = config.admin;

const client = new MongoClient(config['mongodb']['url'], { useNewUrlParser: true });

var glams = {};

function isConnected(client) {
  return !!client && !!client.topology && client.topology.isConnected()
}

function loadGlams(callback) {
  let query = () => {
    const db = client.db(config['mongodb']['database']);
    const collection = db.collection(config['mongodb']['collection']);
    collection.find({}).toArray((err, docs) => {
      docs.forEach((element) => {
        let glam = {
          'name': element['name'],
          'fullname': element['fullname'],
          'category': element['category'],
          'image': element['image'],
          connection: new Pool({
            'user': config['postgres']['user'],
            'password': config['postgres']['password'],
            'host': config['postgres']['host'],
            'port': config['postgres']['port'],
            'database': element['database']
          })
        };

        if (element.hasOwnProperty('lastrun')) {
          glam['lastrun'] = element['lastrun'];
        } else {
          glam['lastrun'] = null;
        }

        if (element.hasOwnProperty('paused')) {
          glam['paused'] = element['paused'];
        } else {
          glam['paused'] = false;
        }

        if (element.hasOwnProperty('http-auth')) {
          glam['http-auth'] = element['http-auth'];
          glam['http-auth']['realm'] = element['name'] + " stats";
        }

        // Glams are never deleted
        glams[glam['name']] = glam;
      });

      if (callback !== undefined)
        callback();
    });
  };

  if (!isConnected(client)) {
    client.connect(query);
  } else {
    query();
  }
}

function insertGlam(glam) {
  let query = () => {
    const db = client.db(config['mongodb']['database']);
    const collection = db.collection(config['mongodb']['collection']);
    collection.insertOne(glam, () => {
      loadGlams();
    });
  };

  if (!isConnected(client)) {
    client.connect(query);
  } else {
    query();
  }
}

function updateGlam(glam) {
  let query = () => {
    const db = client.db(config['mongodb']['database']);
    const collection = db.collection(config['mongodb']['collection']);
    collection.updateOne({ name: glam['name'] }, { $set: glam }, () => {
      loadGlams();
    });
  };

  if (!isConnected(client)) {
    client.connect(query);
  } else {
    query();
  }
}

exports.glams = glams;
exports.loadGlams = loadGlams;
exports.insertGlam = insertGlam;
exports.updateGlam = updateGlam;