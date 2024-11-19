import pg from 'pg';
import dotenv from 'dotenv';
import { pipeline } from 'node:stream/promises';
import fs from 'node:fs';
import { from as copyFrom } from 'pg-copy-streams';

dotenv.config();
console.log('Connecting to database', process.env.PG_DATABASE);
const db = new pg.Pool({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: process.env.PG_REQUIRE_SSL === 'true' ? {
        rejectUnauthorized: false,
    } : undefined,
});

try {
    const dbResult = await db.query('SELECT NOW()');
    console.log('Database connection established on', dbResult.rows[0].now);

    console.log('Recreating tables...');
    await db.query(`
        DROP TABLE IF EXISTS risk_of_poverty;
        DROP TABLE IF EXISTS sex_poverty;
        DROP TABLE IF EXISTS daily_median_income;

        CREATE TABLE risk_of_poverty (
            rop_geo_id SERIAL PRIMARY KEY,
            geo VARCHAR NOT NULL,
            year INT NOT NULL,
            obs_value FLOAT NOT NULL
        );

        CREATE TABLE daily_median_income (
            dmi_geo_id SERIAL PRIMARY KEY,
            geo VARCHAR NOT NULL,
            code VARCHAR NOT NULL,
            year INT NOT NULL,
            median FLOAT NOT NULL
        );

        CREATE TABLE sex_poverty (
            sp_geo_id SERIAL PRIMARY KEY,
            sex VARCHAR NOT NULL,
            geo VARCHAR NOT NULL,
            year INT NOT NULL,
            obs_value FLOAT NOT NULL
        );
    `);

    console.log('Tables recreated.');

    console.log('Copying data from CSV files...');
    await copyIntoTable(db, `
        COPY risk_of_poverty (geo, year, obs_value)
        FROM STDIN
        WITH CSV HEADER
    `, 'db/risk_of_poverty.csv');
    await copyIntoTable(db, `
        COPY daily_median_income (geo, code, year, median)
        FROM STDIN
        WITH CSV HEADER
    `, 'db/daily_median_income.csv');
    await copyIntoTable(db, `
        COPY sex_poverty (sex, geo, year, obs_value)
        FROM STDIN
        WITH CSV HEADER
    `, 'db/sex_poverty.csv');

    console.log('Data copied.');
} catch (err) {
    console.error('Error during database setup:', err);
} finally {
    await db.end();
    console.log('Database connection closed.');
}

async function copyIntoTable(db, sql, file) {
    const client = await db.connect();
    try {
        const ingestStream = client.query(copyFrom(sql));
        const sourceStream = fs.createReadStream(file);
        await pipeline(sourceStream, ingestStream);
    } finally {
        client.release();
    }
}