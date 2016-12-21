var MariaClient = require('mariasql');

var toollabs_user = "alessio";
var toollabs_host = "tools-dev.wmflabs.org";
var toollabs_DB_host = "itwiki.labsdb";
var toollabs_DB_port = 3306;

var DB_NAME = "ETH";
var STARTING_CAT = "Media_contributed_by_the_ETH-Bibliothek";
var mongoURL = 'mongodb://localhost:27017/' + DB_NAME;

var SSH_COMMAND = 'ssh -fN alessio@tools-dev.wmflabs.org -L 3306:itwiki.labsdb:3306';

var connectionToWMF = new MariaClient({
  host: '127.0.0.1',
  user: 'u3175',
  password: 'oolahaerohdeovei',
  db: 'commonswiki_p'
});

exports.SSH_COMMAND = SSH_COMMAND;
exports.connectionToWMF = connectionToWMF;
exports.STARTING_CAT = STARTING_CAT;
exports.mongoURL = mongoURL;
