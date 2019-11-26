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
        return glam !== undefined && glam['status'] === 'running' && glam['lastrun'] !== null;
    }

    // ADMIN PANEL
    app.get('/admin/panel', function (req, res) {
        res.sendFile(__dirname + '/pages/views/admin-panel.html');
    });

    app.get('/admin/new-glam', function (req, res) {
        res.sendFile(__dirname + '/pages/views/new-glam.html');
    });

    app.get('/admin/edit-glam/:id', apicache("1 hour"), function (req, res) {
      let glam = config.glams[req.params.id];
      if (glam !== undefined) {
        res.sendFile(__dirname + '/pages/views/edit-glam.html');
      } else {
        res.sendStatus(400);
      }
    });

    // VIEWS
    app.get('/:id', apicache("1 hour"), function (req, res) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            res.sendFile(__dirname + '/pages/views/index.html');
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/:id/file/:file', apicache("1 hour"), function (req, res) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            res.sendFile(__dirname + '/pages/views/file-page/index.html');
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/:id/category-network', apicache("1 hour"), function (req, res) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            res.sendFile(__dirname + '/pages/views/category-network/index.html');
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/:id/user-contributions', apicache("1 hour"), function (req, res) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            res.sendFile(__dirname + '/pages/views/user-contributions/index.html');
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/:id/usage', apicache("1 hour"), function (req, res) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            res.sendFile(__dirname + '/pages/views/usage/index.html');
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/:id/page-views', apicache("1 hour"), function (req, res) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            res.sendFile(__dirname + '/pages/views/page-views/index.html');
        } else {
            res.sendStatus(400);
        }
    });

    // API
    app.get('/api/admin/auth', function (req, res) {
      res.sendStatus(200);
    });

    app.get('/api/glams', apicache("1 hour"), function (req, res) {
        api.glams(req, res, config.glams);
    });

    app.get('/api/admin/glams', function (request, response) {
        api.glams(request, response, config.glams, true);
    });

    app.post('/api/admin/glams', function (req, res) {
        api.createGlam(req, res, config);
    });

    app.get('/api/admin/glams/:id', function (req, res) {
        let glam = config.glams[req.params.id];
        if (glam !== undefined) {
            api.getAdminGlam(req, res, glam);
        } else {
            res.sendStatus(404);
        }
    });

    app.put('/api/admin/glams/:id', function (req, res) {
        let glam = config.glams[req.params.id];
        if (glam !== undefined) {
            api.updateGlam(req, res, config);
        } else {
            res.sendStatus(404);
        }
    });

    app.get('/api/glams/:id/annotations', function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (glam !== undefined) {
            api.getAnnotations(req, res, next, glam);
        } else {
            res.sendStatus(404);
        }
    });

    app.get('/api/admin/glams/:id/annotations/:date', function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (glam !== undefined) {
            api.getAnnotation(req, res, next, glam);
        } else {
            res.sendStatus(404);
        }
    });

    app.put('/api/admin/glams/:id/annotations/:date', function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (glam !== undefined) {
            api.modifyAnnotation(req, res, next, glam);
        } else {
            res.sendStatus(404);
        }
    });

    app.post('/api/admin/glams/:id/annotations/:date', function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (glam !== undefined) {
            api.createAnnotation(req, res, next, glam);
        } else {
            res.sendStatus(404);
        }
    });

    app.delete('/api/admin/glams/:id/annotations/:date', function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (glam !== undefined) {
            api.deleteAnnotation(req, res, next, glam);
        } else {
            res.sendStatus(404);
        }
    });

    app.get('/api/:id/category', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.categoryGraph(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/category/dataset', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.categoryGraphDataset(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/category/:category', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.categoryFiles(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.getGlam(req, res, next, glam);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/views', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.views(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/views/dataset/:timespan', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.viewsDataset(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/views/sidebar', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.viewsSidebar(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/views/file/:file', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam) || req.params.file !== undefined) {
            api.viewsByFile(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/views/stats', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam) || req.params.file !== undefined) {
            api.viewsStats(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/usage', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.usage(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/usage/dataset', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.usageDataset(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/usage/file/:file', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.usageFile(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/usage/stats', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.usageStats(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/usage/top', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.usageTop(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/file/upload-date', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.uploadDate(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/file/upload-date/dataset/:timespan', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.uploadDateDataset(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/file/upload-date-all', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.uploadDateAll(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/file/details/:file', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.fileDetails(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    app.get('/api/:id/search/:query', apicache("1 hour"), function (req, res, next) {
        let glam = config.glams[req.params.id];
        if (isValidGlam(glam)) {
            api.search(req, res, next, glam.connection);
        } else {
            res.sendStatus(400);
        }
    });

    // NOT FOUND
    app.get('*', function (req, res) {
        res.sendStatus(404);
    });

}
