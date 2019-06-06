const ConnectionPool = require('tedious-connection-pool');
const Request = require('tedious').Request;

const poolConfig = {
    min: 1,
    max: 5,
    log: true
};

const connectionConfig = {
    userName: 'Liron_David',
    password: '4RFV_5tgb',
    server: 'assignment3webserver.database.windows.net',
    options: { encrypt: true, database: 'Assignment3db' }
};

//create the pool
const pool = new ConnectionPool(poolConfig, connectionConfig)

pool.on('error', function (err) {
    if (err) {
        console.log(err);
       
    }
});
console.log('pool connection on');


//----------------------------------------------------------------------------------------------------------------------
exports.execQuery = function (query) {
    return new Promise(function (resolve, reject) {

        try {

            let ans = [];
            let properties = [];

            //acquire a connection
            pool.acquire(function (err, connection) {
                if (err) {
                    console.log('acquire ' + err);
                    reject(err);
                }
                console.log('connection on');

                let dbReq = new Request(query, function (err, rowCount) {
                    if (err) {
                        console.log('Request ' + err);
                        reject(err);
                    }
                });

                dbReq.on('columnMetadata', function (columns) {
                    columns.forEach(function (column) {
                        if (column.colName != null)
                            properties.push(column.colName);
                    });
                });
                dbReq.on('row', function (row) {
                    let item = {};
                    for (i = 0; i < row.length; i++) {
                        item[properties[i]] = row[i].value;
                    }
                    ans.push(item);
                });

                dbReq.on('requestCompleted', function () {
                    console.log('request Completed: ' + dbReq.rowCount + ' row(s) returned');
                    console.log(ans);
                    connection.release();
                    resolve(ans);

                });
                connection.execSql(dbReq);

            });
        } catch (err) {
            reject(err)
        }
    });

};
