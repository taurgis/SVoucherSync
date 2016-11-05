if (window.openDatabase) {
    //Create the database the parameters are 1. the database name 2.version number 3. a description 4. the size of the database (in bytes) 1024 x 1024 = 1MB
    var mydb = openDatabase("tickets", "0.1", "A Database of scanned tickets", 1024 * 1024 * 5);

    //create the cars table using SQL for the database using a transaction
    mydb.transaction(function (t) {
        t.executeSql("CREATE TABLE IF NOT EXISTS scanned_tickets (id TEXT PRIMARY KEY ASC, timesscanned INTEGER, lasttimescanned INTEGER)");
    });
} else {
};

function insertScan(code) {
    mydb.transaction(function (t) {
        t.executeSql("select * from scanned_tickets where id = ?", [code], function(transaction, sqlResult) {
          if(sqlResult.rows.length > 0) {
              t.executeSql("update scanned_tickets set timesscanned = timesscanned + 1, lasttimescanned = ? where id = ?", [ new Date().getTime(), code]);
          }else {
              t.executeSql("insert into scanned_tickets values (?, ?, ?)", [code, 1, new Date().getTime()]);
          }
        });
    });
}
