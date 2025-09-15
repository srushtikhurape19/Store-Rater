const fs = require('fs');
const path = require('path');
const db = require('../db');

async function initializeDatabase() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Initializing database schema...');
        await db.query(schemaSql);
        console.log('Database schema initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
