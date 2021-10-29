const fs = require('fs');
const ini = require('ini');
const mime = require('mime-types');
const path = require('path');
const ISO6391 = require('iso-639-1');
const Mustache = require('mustache');
Mustache.tags = ['§[', ']§'];

const localesFolder = './locales';

let defaultLanguage = 'en';
let homeTitle = null;
let ownerLogo = null;

// Load owner logo if any
try {
    ownerLogo = fs.readFileSync('../config/owner-logo.svg');
} catch {
    // pass
}

// Load config if any
try {
    const i18nFile = fs.readFileSync('../config/i18n.json');
    if (i18nFile) {
        const i18nConfig = JSON.parse(i18nFile);
        if (i18nConfig.defaultLanguage) {
            defaultLanguage = i18nConfig.defaultLanguage
        }
        if (i18nConfig.homeTitle) {
            homeTitle = i18nConfig.homeTitle;
        }
    }
} catch {
    // pass
}

const messages = {};

// Load default language
messages[defaultLanguage] = {};
fs.readdirSync(localesFolder + '/' + defaultLanguage).forEach(namespace => {
    const items = ini.parse(fs.readFileSync(localesFolder + '/' + defaultLanguage + '/' + namespace, 'utf-8'));
    messages[defaultLanguage][namespace.replace('.ini', '')] = items
});
if (homeTitle) {
    messages[defaultLanguage]['messages']['home-slogan'] = homeTitle;
}

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
    if (homeTitle) {
        messages[language]['messages']['home-slogan'] = homeTitle;
    }
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
    if (res.recaptcha) {
        data = data.replace("<!-- RECAPTCHA -->", res.recaptcha);
    }
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
        // Remove query string
        let pathname = decodeURIComponent(req.url.split('?').shift());
        // Redirect homepage
        if (pathname === '/')
            pathname = '/index.html';
        // Manage owner logo
        if (pathname === '/assets/img/owner-logo.svg' && ownerLogo) {
            res.setHeader('Content-Type', 'image/svg+xml');
            res.send(ownerLogo);
            return;
        }
        const fileName = path.join(dir, pathname);
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

exports.languages = function (req, res) {
    const targetLanguage = getLanguage(req, res);
    const languages = [targetLanguage];
    for (const key in messages) {
        if (messages.hasOwnProperty(key) && targetLanguage !== key) {
            languages.push(key);
        }
    }
    res.send(ISO6391.getLanguages(languages));
};
