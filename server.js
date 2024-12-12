import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: process.env.PG_REQUIRE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

app.get('/risk_of_poverty/:year', async (req, res) => {
  const year = req.params.year;
  try {
    const result = await pool.query('SELECT geo, obs_value FROM risk_of_poverty WHERE year = $1', [year]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching data for risk_of_poverty:', err);
    res.status(500).send('Server Error');
  }
});

app.get('/sex_poverty', async (req, res) => {
  try {
    const result = await pool.query('SELECT sex, geo, year, obs_value FROM sex_poverty');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching data for sex_poverty:', err);
    res.status(500).send('Server Error');
  }
});

app.get('/daily_median_income', async (req, res) => {
  try {
    const result = await pool.query('SELECT geo, code, year, median FROM daily_median_income');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching data for daily_median_income:', err);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

