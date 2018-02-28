var {Pool, Client} = require('pg');
  var DBs = [
    {
      name:"ZU",
      fullname: "Canton of Zürich",
      category:"Category:Historical images of buildings in the canton of Zürich",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'cassandradb',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"ETH",
      fullname: "ETH Library of Zurich",
      category:"Category:Media contributed by the ETH-Bibliothek",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'eth',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"SNL",
      fullname: "Swiss National Library",
      category:"Category:Media contributed by the Swiss National Library",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'snl',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"SBB",
      fullname:"SBB Historic",
      category:"Category:SBB Historic",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'sbb',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"BUL",
      fullname: "University Library of Basel",
      category:"Category:Media contributed by the Basel University Library",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'bul',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"SFA",
      fullname: "Swiss Federal Archives",
      category:"Category:Media contributed by the Swiss Federal Archives",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'sfa',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"CLS",
      fullname : "Central Library Solothurn",
      category:"Category:Media contributed by Zentralbibliothek Solothurn",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'cls',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"ZBZ",
      fullname: "Zentralbibliothek Zürich",
      category:"Category:Media contributed by Zentralbibliothek Zürich",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'zbz',
        password: 'postgres',
        port: 5432
      })
    },
    {
      name:"WMCH",
      fullname:"Supported by Wikimedia CH",
      category:"Category:Supported by Wikimedia CH",
      connection:new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'wmch',
        password: 'postgres',
        port: 5432
      })
    }
  ];

  var SERVICE_USER = "test";
  var SERVICE_PASSWORD = "test";

  function getIndexOfDb(id,arr) {
      var i = 0;
      while (i < arr.length) {
          if(arr[i].name === id)
              break;
          i++;
      }
      if (i === arr.length)
          i = -1;
      return i;
  }

  exports.DBs = DBs;
  exports.SERVICE_USER = SERVICE_USER;
  exports.SERVICE_PASSWORD = SERVICE_PASSWORD;
  exports.getIndexOfDb = getIndexOfDb;
