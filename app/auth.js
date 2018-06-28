var auth = require('http-auth');

var authETH = auth.basic({
        realm: "ETH stats"
    }, function (username, password, callback) {
        callback(username === "eth"
              && password === "PASSWORD");
    }
);

var authSBB = auth.basic({
        realm: "SBB stats"
    }, function (username, password, callback) {
        callback(username === "sbb"
              && password === "PASSWORD");
    }
);

var authBUL = auth.basic({
        realm: "BUL stats"
    }, function (username, password, callback) {
        callback(username === "bul"
              && password === "PASSWORD");
    }
);

var authSFA = auth.basic({
        realm: "SFA stats"
    }, function (username, password, callback) {
        callback(username === "sfa"
              && password === "PASSWORD");
    }
);

var authSNL = auth.basic({
        realm: "SNL stats"
    }, function (username, password, callback) {
        callback(username === "snl"
              && password === "PASSWORD");
    }
);

var authZBZ = auth.basic({
        realm: "ZBZ stats"
    }, function (username, password, callback) {
        callback(username === "zbz"
              && password === "PASSWORD");
    }
);

var authCLS = auth.basic({
        realm: "CLS stats"
    }, function (username, password, callback) {
        callback(username === "cls"
              && password === "PASSWORD");
    }
);

exports.authETH = authETH;
exports.authSBB = authSBB;
exports.authBUL = authBUL;
exports.authSFA = authSFA;
exports.authSNL = authSNL;
exports.authZBZ = authZBZ;
exports.authCLS = authCLS;
