var config = require("../config/config.js");
var fs = require("fs");

var endSetup = function () {
    console.log("Setup ended");
    process.exit(0);
};

var processQuery = function (db, files, step) {
    if (step >= files.length) {
        endSetup();
        return;
    }
    filetoRead = "SQL/" + files[step];
    console.log(filetoRead);
    fs.readFile(filetoRead, 'ascii', function (_, read) {
        // console.log("Executing: ");
        read = read.toString('ascii');
        // console.log(read);
        db.query(read, function (err, b) {
            if (!err) {
                processQuery(db, files, step+1);
            }
            else {
                console.log("Error in step " + step);
                console.log(err);
                endSetup();
                return;
            }
        })
    })
};

if (process.argv.length != 3) {
    console.log('Missing GLAM name');
    process.exit(1);
}

config.loadGlams(() => {
    var glam = config.glams[process.argv[2]];

    if (glam === undefined) {
        console.log('Unknown GLAM name');
        process.exit(1);
    }
    
    var files = ["db_init.sql", "dailyInsert.sql", "functions.sql", "maintenance.sql"];

    console.log("Setup started");
    processQuery(glam.connection, files, 0);
});
