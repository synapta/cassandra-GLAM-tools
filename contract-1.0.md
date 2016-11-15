The parts of the project "GLAM Statistical Tool (Cassandra)" that Synapta Srl
offers to implement are the following.

* Implementation of the first two statistical features. (4)
    * Statistics by categories (4.3): total number of files uploaded by an
institution (by date); analytics by category.
    * Statistics by use (4.4): pages in which a file is used (by date);
possibility to aggregate pages by project language.

* Partial implementation of the third statistical feature (statistic by visitors).
(4.5)
    * Feasibility study for the statistic by visitors, in order to identify the
best way to get those data, that currently are not present in the same
database instance as others. The output of the study is the method to
retrieve: visitors by page with a 1 day span; visitors by files (the
File:test.png page) with a 1 day span.

* Implementation of ETL for data replication. (9.1)
    * We will replicate only the dataset needed for the statistics (not the
overall dump) using SOL queries to Wikimedia databases.

* Partial implementation of ETL for data quality. (9.2)
    * A module will check data integrity before writing in the local database
in order to have just high quality data and to manage possible
malfunctions from Wikimedia sources.

* First implementation of the database. (1 1.1)
    * A mongoDB instance will be used as first database implementation. It
will get input data from ETL and will serve them through query
wrapped by APls.

* Implementation of the first version of API. (10.1)
    * First version of JSON API (the minimum number to let first two
statistical features operate): REST API via a node.js server.
