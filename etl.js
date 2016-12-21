var MariaClient = require('mariasql');
var MongoClient = require('mongodb').MongoClient;
var config = require('./config.js');

//XXX if loop, can lasts forever
var catCounter = 0;
var findCat = function (current, parent, callback) {
    catCounter++;
    console.log("[ADD] category " + current +  " to mongo");
    categories.update(
        { page_title: current },
        { $set: { page_title: current, parent: parent } },
        { upsert: true },
        function(err, result) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            console.log("[DONE] category " + current + " in mongo");
            //console.log(result)

            //NEXT!

            var findCatChildren = "SELECT page_title \
                                   FROM categorylinks, page \
                                   WHERE cl_to = '" + current + "' \
                                   AND page_id = cl_from \
                                   AND page_namespace = 14"

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
                    findCat(rows[r].page_title, current, callback);
                }

                if (catCounter == 1) {
                    callback();
                }
            });
        })
}

var filesInCat = function (current, callback) {
    var query = "SELECT img_name, img_user_text, img_timestamp, img_size \
                 FROM categorylinks, page, image \
                 WHERE cl_to = '" + current + "' \
                 AND page_id = cl_from \
                 AND page_namespace = 6 \
                 AND img_name = page_title \
                 LIMIT 100"; //XXX remove limit

    console.log("[ASK] files for " + current);
    config.connectionToWMF.query(query, function(err, rows) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log("[GOT] files for " + current);

        console.log("[ADD] files for " + current +  " to mongo");
        var fileSaved = 1;
        for (var f = 0; f < rows.length; f++) {
            files.update(
                { img_name: rows[f].img_name },
                { $set: rows[f] },
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

console.log("Opening connection to MongoDB...")
MongoClient.connect(config.mongoURL, function(err, db) {
    console.log("Connected correctly to the database!");
    categories = db.collection('category');
    files = db.collection('file');

    console.log("Starting collecting subcategories from " + config.STARTING_CAT)
    findCat(config.STARTING_CAT, null, function () {
        console.log("Downloading file info from " + config.STARTING_CAT)
        filesInCat(config.STARTING_CAT, function () {
            process.exit(0);
        });
    });
});
