var express = require('express');
var api = require('./api.js');
var auth = require('http-auth');

var config = require('../config/config.js');

// Reload configuration every hour because MongoDB is also modified by run.py
function loadGlams() {
    config.loadGlams();
    setTimeout(loadGlams, 3600000);
}

loadGlams();

module.exports = function (app, apicache) {

    app.use('/', express.static(__dirname + '/pages'));

    app.get('/docs', function (req, res) {
        res.sendFile(__dirname + '/pages/docs.html');
    });

    app.get('/404', function (req, res) {
        res.sendStatus(404);
    });

    app.get('/500', function (req, res) {
        res.sendStatus(500);
    });

    app.use(function (req, res, next) {
        function getId(path) {
            let exploded = path.split('/');
            if (path.startsWith('/api/')) {
                return exploded[2];
            } else {
                return exploded[1];
            }
        }

        function createAuth(auth_config) {
            let auth_basic = auth.basic({
                realm: auth_config['realm']
            }, function (username, password, callback) {
                callback(username === auth_config['username']
                    && password === auth_config['password']);
            });
            (auth.connect(auth_basic))(req, res, next);
        }

        let id = getId(req.path);

        if (id === 'admin') {
            createAuth(config.admin);
        } else {
            let glam = config.glams[id];

            if (glam === undefined) {
                next();
            } else if (glam.hasOwnProperty('http-auth') === false) {
                next();
            } else {
                createAuth(glam['http-auth']);
            }
        }
    });

    function isValidGlam(glam) {
        return glam !== undefined && glam['paused'] === false && glam['lastrun'] !== null;
    }

    // ADMIN PANEL
    app.get('/admin/panel', function (req, res) {
        res.sendFile(__dirname + '/pages/views/admin-panel.html');
    });

    app.get('/admin/new-glam', function (req, res) {
        res.sendFile(__dirname + '/pages/views/new-glam.html');
    });

    app.get('/admin/edit-glam/:id', apicache("1 hour"), function (request, response) {
      let glam = config.glams[request.params.id];
      if (glam !== undefined) {
        response.sendFile(__dirname + '/pages/views/edit-glam.html');
      } else {
        response.sendStatus(400);
      }
    });

    // VIEWS
    app.get('/:id', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            response.sendFile(__dirname + '/pages/views/index.html');
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/:id/category-network', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            response.sendFile(__dirname + '/pages/views/category-network/index.html');
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/:id/user-contributions', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            response.sendFile(__dirname + '/pages/views/user-contributions/index.html');
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/:id/usage', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            response.sendFile(__dirname + '/pages/views/usage/index.html');
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/:id/page-views', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            response.sendFile(__dirname + '/pages/views/page-views/index.html');
        } else {
            response.sendStatus(400);
        }
    });

    // API
    app.get('/api/glams', apicache("1 hour"), function (request, response) {
        api.glams(request, response, config.glams);
    });

    app.get('/api/admin/glams', function (request, response) {
        api.glams(request, response, config.glams, true);
    });

    app.post('/api/admin/glams', function (request, response) {
        api.createGlam(request, response, config);
    });

    app.get('/api/admin/glams/:id', function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.getAdminGlam(request, response, glam);
        } else {
            response.sendStatus(404);
        }
    });

    app.put('/api/admin/glams/:id', function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.updateGlam(request, response, config);
        } else {
            response.sendStatus(404);
        }
    });

    app.get('/api/admin/glams/:id/annotations', function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.getAnnotations(request, response, glam);
        } else {
            response.sendStatus(404);
        }
    });

    app.get('/api/admin/glams/:id/annotations/:date', function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.getAnnotation(request, response, glam);
        } else {
            response.sendStatus(404);
        }
    });

    app.put('/api/admin/glams/:id/annotations/:date', function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.modifyAnnotation(request, response, glam);
        } else {
            response.sendStatus(404);
        }
    });

    app.post('/api/admin/glams/:id/annotations/:date', function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.createAnnotation(request, response, glam);
        } else {
            response.sendStatus(404);
        }
    });

    app.delete('/api/admin/glams/:id/annotations/:date', function (request, response) {
        let glam = config.glams[request.params.id];
        if (glam !== undefined) {
            api.deleteAnnotation(request, response, glam);
        } else {
            response.sendStatus(404);
        }
    });

    app.get('/api/:id/category', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            api.categoryGraph(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            api.getGlam(request, response, glam);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/views', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            api.views(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/views/all', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            api.viewsAll(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/views/sidebar', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            api.viewsSidebar(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/views/file/:file', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam) || request.params.file !== undefined) {
            api.viewsByFile(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/usage', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            api.usage(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/usage/stats', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            api.usageStats(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/usage/top', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            api.usageTop(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/usage/sidebar', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            api.usageSidebar(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/file/upload-date', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            api.uploadDate(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    app.get('/api/:id/file/upload-date-all', apicache("1 hour"), function (request, response) {
        let glam = config.glams[request.params.id];
        if (isValidGlam(glam)) {
            api.uploadDateAll(request, response, glam.connection);
        } else {
            response.sendStatus(400);
        }
    });

    // NOT FOUND
    app.get('*', function (req, res) {
        res.sendStatus(404);
    });

}
