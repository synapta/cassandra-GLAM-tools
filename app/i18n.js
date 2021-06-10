const fs = require('fs');
const ini = require('ini');
const mime = require('mime-types');
const path = require('path');
const Mustache = require('mustache');
Mustache.tags = ['§[', ']§'];

const localesFolder = './locales';
const defaultLanguage = 'en';

const messages = {};

// Load default language
messages[defaultLanguage] = {};
fs.readdirSync(localesFolder + '/' + defaultLanguage).forEach(namespace => {
    const items = ini.parse(fs.readFileSync(localesFolder + '/' + defaultLanguage + '/' + namespace, 'utf-8'));
    messages[defaultLanguage][namespace.replace('.ini', '')] = items
});

// Load other languages
fs.readdirSync(localesFolder).forEach(language => {
    if (language === defaultLanguage) {
        return;
    }
    messages[language] = Object.assign({}, messages[defaultLanguage]);
    fs.readdirSync(localesFolder + '/' + language).forEach(namespace => {
        const items = ini.parse(fs.readFileSync(localesFolder + '/' + language + '/' + namespace, 'utf-8'));
        messages[language][namespace.replace('.ini', '')] = items
    });
});

function getLanguage(req, res) {
    if (req.query.lang && req.query.lang in messages) {
        // If possible set the new language
        if (res) {
            res.cookie('cassandra_lang', req.query.lang);
        }
        return req.query.lang;
    }
    if (req.cookies['cassandra_lang'] && req.cookies['cassandra_lang'] in messages) {
        return req.cookies['cassandra_lang'];
    }
    const accept = req.header('Accept-Language');
    if (accept) {
        for (const lang of accept.split(';').join(',').split(',')) {
            if (lang in messages) {
                return lang;
            }
        }
    }
    return defaultLanguage;
}

exports.renderResponse = function (req, res, data) {
    const targetLanguage = getLanguage(req, res);
    return Mustache.render(data, messages[targetLanguage]);
};

exports.sendFile = function (req, res, file) {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }
        res.send(exports.renderResponse(req, res, data));
    });
};

exports.static = function (dir) {
    return function (req, res, next) {
        if (req.url === '/')
            req.url = '/index.html';
        const fileName = path.join(dir, req.url);
        const fileType = mime.lookup(fileName) || 'application/octet-stream';
        const enconding = fileType.startsWith('text') || fileType.startsWith('application') ? 'utf8' : null;
        fs.readFile(fileName, enconding, (err, data) => {
            if (err) {
                next();
                return;
            }
            res.setHeader('Content-Type', fileType);
            if (enconding) {
                res.send(exports.renderResponse(req, res, data));
            } else {
                res.send(data);
            }
        });
    };
};
