const mysql = require('mysql')

const conn = mysql.createConnection({
    // host: 'db4free.net',
    // port: 3306,
    // user: 'sineaskolektif',
    // password: 'qwerty321',
    // database: 'sineaskolektif',
    // timezone: 'UTC'

    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sineas_kolektif',
    timezone: 'UTC'
})

module.exports = {
    sqlDB: conn
}