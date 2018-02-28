var express = require('express');
var api = require('./api.js');
var config = require('./config.js');
var auth = require('http-auth');

var basic = auth.basic({
        realm: "GLAM tools"
    }, function (username, password, callback) { // Custom authentication method.
        callback(username === config.SERVICE_USER && password === config.SERVICE_PASSWORD);
    }
);

var DBConnections=[];

function getDatabase(id){
    index = config.getIndexOfDb(id, DBConnections);
    if(index !== -1)
        return DBConnections[index].connection;
    else {
        index = config.getIndexOfDb(id, config.DBs);
        if(index === -1)
            return null;
        else {
            conn = Object();
            conn.name = config.DBs[index].name;
            conn.connection = config.DBs[index].connection;
            conn.connection.connect();
            DBConnections[DBConnections.length] = conn;
            return conn.connection;
        }
    }
}

module.exports = function(app, apicache) {

  app.use('/',express.static(__dirname + '/pages'));

  app.get('/docs', function(req, res){
      res.sendFile(__dirname + '/pages/docs.html');
  });

  app.get('/404', function(req, res){
	    res.sendStatus(404);
	});

  app.get('/500', function(req, res){
	    res.sendStatus(500);
	});

  //VIEWS

  app.get('/:id', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          response.sendFile(__dirname + '/pages/views/index.html');
      } else {
          response.sendStatus(400);
      }
  });

  app.get('/:id/category-network', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          response.sendFile(__dirname + '/pages/views/category-network/index.html');
      } else {
          response.sendStatus(400);
      }
  });
  app.get('/:id/user-contributions', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          response.sendFile(__dirname + '/pages/views/user-contributions/index.html');
      } else {
          response.sendStatus(400);
      }
  });
  app.get('/:id/usage', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          response.sendFile(__dirname + '/pages/views/usage/index.html');
      } else {
          response.sendStatus(400);
      }
  });
  app.get('/:id/page-views', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          response.sendFile(__dirname + '/pages/views/page-views/index.html');
      } else {
          response.sendStatus(400);
      }
  });

  //API

	app.get('/api/:id/category/', auth.connect(basic), apicache("1 hour"), function (request, response) {
	    let db = getDatabase(request.params.id);
	    if (db !== null) {
		      api.categoryGraph(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
	app.get('/api/:id/rootcategory/', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.rootCategory(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
  app.get('/api/:id/totalMediaNum/', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.totalMediaNum(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
	app.get('/api/:id/views/by-date', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.viewsByDate(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
	app.get('/api/:id/views/all', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.viewsAll(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
  app.get('/api/:id/views/sidebar', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          api.viewsSidebar(request, response, request.params.id, db);
      } else {
          response.sendStatus(400);
      }
  });
  app.get('/api/:id/views/files', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          api.viewsByFiles(request, response, request.params.id, db);
      } else {
          response.sendStatus(400);
      }
  });
	app.get('/api/:id/usage/', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.usage(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
  app.get('/api/:id/usage/stat', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.usageStat(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
  app.get('/api/:id/usage/top', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.usageTop(request, response, request.params.id, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
  app.get('/api/:id/usage/sidebar', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          api.usageSidebar(request, response, request.params.id, db);
      } else {
          response.sendStatus(400);
      }
  });
	app.get('/api/:id/file/upload-date', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
		      api.uploadDate(request, response, request.params.id, request.query.start, request.query.end, db);
	    } else {
		      response.sendStatus(400);
	    }
	});
  app.get('/api/:id/file/upload-date-all', auth.connect(basic), apicache("1 hour"), function (request, response) {
      let db = getDatabase(request.params.id);
      if (db !== null) {
          api.uploadDateAll(request, response, request.params.id, db);
      } else {
          response.sendStatus(400);
      }
  });

  //NOT FOUND

	app.get('*', function(req, res){
	    res.sendStatus(404);
	});

}
