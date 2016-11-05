if (window.openDatabase) {
    //Create the database the parameters are 1. the database name 2.version number 3. a description 4. the size of the database (in bytes) 1024 x 1024 = 1MB
    var mydb = openDatabase("tickets", "0.1", "A Database of scanned tickets", 1024 * 1024 * 5);

    //create the cars table using SQL for the database using a transaction
    mydb.transaction(function(t) {
        t.executeSql("CREATE TABLE IF NOT EXISTS scanned_tickets (id TEXT PRIMARY KEY ASC, timesscanned INTEGER, lasttimescanned INTEGER)");
    });
} else {};
var scansPerHourChart = undefined;
var scansPerDayChart = undefined;
createScansPerHourChart();
createScansPerDayChart();

function insertScan(code) {
    mydb.transaction(function(t) {
        t.executeSql("select * from scanned_tickets where id = ?", [code], function(transaction, sqlResult) {
            if (sqlResult.rows.length > 0) {
                t.executeSql("update scanned_tickets set timesscanned = timesscanned + 1, lasttimescanned = ? where id = ?", [new Date().getTime(), code], function() {
                    createScansPerHourChart();
                    createScansPerDayChart();
                });
            } else {
                t.executeSql("insert into scanned_tickets values (?, ?, ?)", [code, 1, new Date().getTime()], function() {
                    createScansPerHourChart();
                    createScansPerDayChart();
                });
            }
        });
    });
}



function createScansPerHourChart() {
    var hoursToShow = [];
    var scansPerHour = {};
    mydb.transaction(function(t) {
        t.executeSql("select * from scanned_tickets", [], function(transaction, sqlResult) {
            for (var rowIndex = 0; rowIndex < sqlResult.rows.length; rowIndex++) {
                var row = sqlResult.rows[rowIndex];
                var dateScanned = new Date(row.lasttimescanned);
                var hour = dateScanned.getHours();

                if (hoursToShow.indexOf(hour) < 0) {
                    hoursToShow.push(hour);
                }

                if (scansPerHour[hour]) {
                    scansPerHour[hour] += 1;
                } else {
                    scansPerHour[hour] = 1;
                }
            }
            var dataAsArray = [];

            for (var i = 0; i < hoursToShow.length; i++) {
                dataAsArray.push(scansPerHour[hoursToShow[i]]);
            }

            if (scansPerHourChart === undefined) {
                scansPerHourChart = drawChart(document.getElementById("myChart"), hoursToShow.sort(), dataAsArray);
            } else {
                scansPerHourChart.data.datasets[0].data = dataAsArray;
                scansPerHourChart.update();
            }
        });
    });
};

function createScansPerDayChart() {
    var daysToShow = [];
    var scansPerDay = {};
    mydb.transaction(function(t) {
        t.executeSql("select * from scanned_tickets", [], function(transaction, sqlResult) {
            for (var rowIndex = 0; rowIndex < sqlResult.rows.length; rowIndex++) {
                var row = sqlResult.rows[rowIndex];
                var dateScanned = new Date(row.lasttimescanned);
                var day = dateScanned.toDateString();

                if (daysToShow.indexOf(day) < 0) {
                    daysToShow.push(day);
                }

                if (scansPerDay[day]) {
                    scansPerDay[day] += 1;
                } else {
                    scansPerDay[day] = 1;
                }
            }
            var dataAsArray = [];

            for (var i = 0; i < daysToShow.length; i++) {
                dataAsArray.push(scansPerDay[daysToShow[i]]);
            }

            if (scansPerDayChart === undefined) {
                scansPerDayChart = drawPieChart(document.getElementById("myPieChart"), daysToShow.sort(), dataAsArray);
            } else {
                scansPerDayChart.data.datasets[0].data = dataAsArray;
                scansPerDayChart.update();
            }
        });
    });
}

function drawChart(element, labels, data) {
    var ctx = element;
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '# of scans per hour',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

    return myChart;
}

function drawPieChart(element, labels, data) {
    return new Chart(element, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ]
            }]
        }
    });
}
