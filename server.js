require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Get transactions (with optional filters)
app.get('/api/transactions', async (req, res) => {
    try {
        const { month, year } = req.query;
        let query = 'SELECT * FROM transactions';
        const params = [];

        if (month && year) {
            query += ' WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2';
            params.push(month, year);
        } else if (year) {
            query += ' WHERE EXTRACT(YEAR FROM created_at) = $1';
            params.push(year);
        }

        query += ' ORDER BY created_at DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add a transaction
app.post('/api/transactions', async (req, res) => {
    try {
        const { type, description, category, amount, expense_type } = req.body;
        const result = await pool.query(
            'INSERT INTO transactions (type, description, category, amount, expense_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [type, description, category, amount, expense_type]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a transaction
app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a transaction
app.put('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type, description, category, amount, expense_type } = req.body;
        const result = await pool.query(
            'UPDATE transactions SET type = $1, description = $2, category = $3, amount = $4, expense_type = $5 WHERE id = $6 RETURNING *',
            [type, description, category, amount, expense_type, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
