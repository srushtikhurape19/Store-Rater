require('dotenv').config({ override: true });
const mysql = require('mysql2/promise');

console.log('MySQL Connection Parameters:');
console.log('Host:', process.env.MYSQL_HOST);
console.log('User:', process.env.MYSQL_USER);
console.log('Password:', process.env.MYSQL_PASSWORD ? '**** (hidden)' : 'NOT SET');
console.log('Database:', process.env.MYSQL_DATABASE);
console.log('Port:', process.env.MYSQL_PORT);

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'your_database_name',
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true // Allow multiple SQL statements in a single query
});

pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database!');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL database:', err);
        process.exit(1);
    });

module.exports = pool;
