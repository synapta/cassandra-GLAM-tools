var MariaClient = require('mariasql');
var {Pool, Client} = require('pg');
var fs=require('fs');

var connectionToWMF = new MariaClient({
    host: '127.0.0.1',
    user: 'uxxxx', //PUT HERE YOUR USER
    password: 'xxxx', //PUT HERE YOUR PWD
    db: 'commonswiki_p'
});
var conf=fs.readFileSync("../config.json");
var credentials=JSON.parse(conf);
var DBs = [
  {
    name:"ZU",
    fullname: "Canton of Zürich",
    category:"Historical images of buildings in the canton of Zürich",
    connection:new Client(credentials["zu"])
  },
  {
    name:"ETH",
    fullname: "ETH Library of Zurich",
    category:"Media contributed by the ETH-Bibliothek",
    connection:new Client(credentials["eth"])
  },
  {
    name:"SNL",
    fullname: "Swiss National Library",
    category:"Media contributed by the Swiss National Library",
    connection:new Client(credentials["snl"])

  },
  {
    name:"SBB",
    fullname:"SBB Historic",
    category:"SBB Historic",
    connection:new Client(credentials["sbb"])

  },
  {
    name:"BUL",
    fullname: "University Library of Basel",
    category:"Media contributed by the Basel University Library",
    connection:new Client(credentials["bul"])

  },
  {
    name:"SFA",
    fullname: "Swiss Federal Archives",
    category:"Media contributed by the Swiss Federal Archives",
    connection:new Client(credentials["sfa"])

  },
  {
    name:"CLS",
    fullname : "Central Library Solothurn",
    category:"Media contributed by Zentralbibliothek Solothurn",
    connection:new Client(credentials["cls"])

  },
  {
    name:"ZBZ",
    fullname: "Zentralbibliothek Zürich",
    category:"Media contributed by Zentralbibliothek Zürich",
    connection:new Client(credentials["zbz"])

  }/*,
  {
    name:"WMCH",
    fullname:"Supported by Wikimedia CH",
    category:"Supported by Wikimedia CH",
    connection:new Client({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'wmch',
      password: 'postgres',
      port: 5432
    })
  }*/
];

exports.connectionToWMF = connectionToWMF;
exports.DBs = DBs;
