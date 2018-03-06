var Config=require("./etl/config.js");
var fs=require("fs");
var i=0;
var DB;
var DBs;
var EndSetup=function()
{
    DB.end();
    i++;
    if(i==DBs.length)
        console.log("Setup ended");
    else
    {
        DB=DBs[i].connection;
        step=0;
        DB.connect();
        ProcessQuery();
    }
}
var ProcessQuery=function()
{
    if(step>=installationFiles.length)
    {
        EndSetup();
        return;
    }
    filetoRead="SQL/"+installationFiles[step];
    console.log(filetoRead);
    fs.readFile(filetoRead,'ascii',function(err,read){
        console.log("Executing: ");
        read=read.toString('ascii').substring(3);
        console.log(read);
        DB.query(read,function(err2,b)
        {
            if(!err2)
            {
                step++;
                ProcessQuery();
            }
            else
            {
                console.log("Error in step "+step);
                console.log(err2);
                EndSetup();
                return;
            }
        })
    })

}
console.log("Welcome in the installation script for Cassandra. Please note you must already have installed PostgreSql, created a database suited for this application (see setup/SQL/db_create.sql for an example) and created a user to use in this application");
var installationFiles=["db_init.sql","dailyInsert.sql","functions.sql","maintenance.sql"];
var DBs=Config.DBs;
DB=DBs[0].connection;
DB.connect();
var step=0;
ProcessQuery();

