var cmd = require('node-cmd');
var MariaClient = require('mariasql');
var MongoClient = require('mongodb');
var config = require('./config.js');

//XXX if loop, can lasts forever
var catCounter = 0;
var findCat = function (current, parent, pages, level, callback) {
    catCounter++;
    console.log("[ADD] category " + current +  " to mongo");
    categories.update(
        { page_title: current },
        { $set: { page_title: decode_utf8(current), parent: decode_utf8(parent), level: ++level, cat_pages: parseInt(pages) } },
        { upsert: true },
        function(err, result) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            console.log("[DONE] category " + current + " in mongo");
            //console.log(result)

            //NEXT!

            var findCatChildren = "SELECT page_title, cat_pages \
                                   FROM categorylinks, page, category \
                                   WHERE cl_to = '" + current + "' \
                                   AND page_id = cl_from \
                                   AND page_namespace = 14 \
                                   AND page_title = cat_title";

            console.log("[ASK] subcategories for " + current);
            config.connectionToWMF.query(findCatChildren, function(err, rows) {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
                console.log("[GOT] subcategories for " + current);
                //console.dir(rows);

                if (rows.length == 0) {
                    catCounter--;
                }

                for (var r = 0; r < rows.length; r++) {
                    findCat(rows[r].page_title, current, rows[r].cat_pages, level, callback);
                }

                if (catCounter == 1) {
                    callback();
                }
            });
        })
}

var filesInCat = function (current, callback) {
    var query = "SELECT img_name, img_user_text, img_timestamp, img_size, cl_to \
                 FROM categorylinks, page, image \
                 WHERE cl_to = '" + current + "' \
                 AND page_id = cl_from \
                 AND page_namespace = 6 \
                 AND img_name = page_title";

    console.log("[ASK] files for " + current);
    config.connectionToWMF.query(query, function(err, rows) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log("[GOT] files for " + current);

        console.log("[ADD] files for " + current +  " to mongo");
        var fileSaved = 0;
        for (var f = 0; f < rows.length; f++) {
            files.update(
                { img_name: decode_utf8(rows[f].img_name) },
                { $set: {img_name: decode_utf8(rows[f].img_name),
                         img_user_text: decode_utf8(rows[f].img_user_text),
                         img_timestamp: new Date(rows[f].img_timestamp
                           .replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,'$4:$5:$6 $2/$3/$1')),
                         img_size: parseInt(rows[f].img_size),
                         img_size_KB: Math.ceil((parseInt(rows[f].img_size)/1024)),
                         cl_to: decode_utf8(rows[f].cl_to)}
                },
                { upsert: true },
                function(err, result) {
                    fileSaved++;
                    if (fileSaved == rows.length) {
                        console.log("[DONE] files for " + current +  " in mongo");
                        callback();
                    }
                }
            );
        }

    });
}


var addCat = function (db, callback) {
  db.collection('category', function(err, collection) {
      if (!err) {
          collection.find({}).toArray(function(err, docs) {
              var done = 0;
              for (var d = 0; d < docs.length; d++) {
                  var currentCat = docs[d].page_title;
                  console.log("Downloading file info from " + currentCat)
                  filesInCat(currentCat, function () {
                      done++;
                      if (done === docs.length) {
                        callback();
                      }
                  });
              }
          });
        } else {
            console.log(err);
            process.exit(1);
        }
  });
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}


var fileUsage = function (current, callback) {
    var query = "SELECT gil_wiki, gil_page_title, gil_to \
                 FROM globalimagelinks, categorylinks, page, image \
                 WHERE cl_to = '" + current + "' \
                 AND gil_to = img_name \
                 AND gil_page_namespace_id = '0' \
                 AND page_id = cl_from \
                 AND page_namespace = 6 \
                 AND img_name = page_title";;

    console.log("[ASK] usage for " + current);
    config.connectionToWMF.query(query, function(err, rows) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log("[GOT] usage for " + current);

        console.log("[ADD] usage for " + current +  " to mongo");
        var fileSaved = 0;
        for (var f = 0; f < rows.length; f++) {
            usage.update(
                {gil_wiki: rows[f].gil_wiki,
                 gil_page_title: decode_utf8(rows[f].gil_page_title),
                 gil_to: decode_utf8(rows[f].gil_to)},
                { $set: {gil_wiki: rows[f].gil_wiki,
                         gil_page_title: decode_utf8(rows[f].gil_page_title),
                         gil_to: decode_utf8(rows[f].gil_to)}
                },
                { upsert: true },
                function(err, result) {
                    fileSaved++;
                    if (fileSaved == rows.length) {
                        console.log("[DONE] usage for " + current +  " in mongo");
                        callback();
                    }
                }
            );
        }
    });
}


var addUsage = function (db, callback) {
  db.collection('category', function(err, collection) {
    if (!err) {
      collection.find({}).toArray(function(err, docs) {
        var done = 0;
        for (var d = 0; d < docs.length; d++) {
          var currentCat = docs[d].page_title;
          console.log("Downloading file info from " + currentCat);
          fileUsage(currentCat, function () {
            done++;
            if (done === docs.length) {
              callback();
            }
          });
        }
      });
    } else {
        console.log(err);
        process.exit(1);
    }
  });
}


var main = function () {
    console.log("Opening connection to MongoDB...")
    MongoClient.connect(config.mongoURL, function(err, db) {
        console.log("Connected correctly to the database!");
        categories = db.collection('category');
        files = db.collection('file');
        usage = db.collection('usage');

        console.log("Starting collecting subcategories from " + config.STARTING_CAT)
        findCat(config.STARTING_CAT, null, 7565, 0, function () { //XXX the starting cat haven't pages dimension
          addCat(db, function () {
            addUsage(db, function () {
              cmd.run('killall ssh'); //XXX breaks all ssh connections
              process.exit(0);
            })
          })
        });
    });
}

console.log("Opening the SSH tunnel to WMF...")
cmd.run(config.SSH_COMMAND);
setTimeout(main, 5000);
