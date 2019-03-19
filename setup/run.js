var Config = require("../config/config.js");
var fs = require("fs");
var i = 0;
var DB;

var EndSetup = function () {
    DB.end();
    console.log("Setup ended");
    process.exit(0);
};

var ProcessQuery = function () {
    if (step >= installationFiles.length) {
        EndSetup();
        return;
    }
    filetoRead = "SQL/" + installationFiles[step];
    console.log(filetoRead);
    fs.readFile(filetoRead, 'ascii', function (_, read) {
        // console.log("Executing: ");
        read = read.toString('ascii');
        // console.log(read);
        DB.query(read, function (err, b) {
            if (!err) {
                step++;
                ProcessQuery();
            }
            else {
                console.log("Error in step " + step);
                console.log(err);
                EndSetup();
                return;
            }
        })
    })
};

if (process.argv.length != 3) {
    console.log('Missing category index');
    process.exit(1);
}

var INDEX = parseInt(process.argv[2]);

if (INDEX === undefined) {
    console.log('Wrong category index');
    process.exit(1);
}

var installationFiles = ["db_init.sql", "dailyInsert.sql", "functions.sql", "maintenance.sql"];
var DBs = Config.DBs;
DB = DBs[INDEX].connection;
DB.connect();

var step = 0;
ProcessQuery();
