const fs = require('fs');
const ini = require('ini');
const Mustache = require('mustache');

const localesFolder = './locales';

const messages = {};

fs.readdirSync(localesFolder).forEach(language => {
  messages[language] = {};
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
    return 'en';
}

exports.sendFile = function (req, res, file) {
    const targetLanguage = getLanguage(req, res);
    fs.readFile(file, 'utf8' , (err, data) => {
        if (err) {
          console.error(err);
          res.redirect('/500');
          return;
        }
        res.send(Mustache.render(data, messages[targetLanguage]));
    });
};

exports.renderResponse = function (req, response) {
    const targetLanguage = getLanguage(req);
    return Mustache.render(response, messages[targetLanguage]);
};