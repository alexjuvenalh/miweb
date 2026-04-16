require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const Joi = require('joi');

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

// ============================================================
// VALIDATION SCHEMAS (Joi)
// ============================================================

const transactionSchema = Joi.object({
    type: Joi.string()
        .valid('income', 'expense')
        .required()
        .messages({
            'string.empty': 'El tipo es requerido',
            'any.only': 'El tipo debe ser "income" o "expense"'
        }),
    
    description: Joi.string()
        .min(1)
        .max(500)
        .required()
        .messages({
            'string.empty': 'La descripcion es requerida',
            'string.min': 'La descripcion debe tener al menos 1 caracter',
            'string.max': 'La descripcion no puede exceder 500 caracteres'
        }),
    
    category: Joi.string()
        .max(100)
        .when('type', {
            is: 'expense',
            then: Joi.required().messages({
                'any.required': 'La categoria es requerida para gastos'
            }),
            otherwise: Joi.optional().allow(null, '')
        }),
    
    amount: Joi.number()
        .positive()
        .max(1000000)
        .required()
        .messages({
            'number.base': 'El monto debe ser un numero',
            'number.positive': 'El monto debe ser positivo',
            'number.max': 'El monto no puede exceder 1,000,000',
            'any.required': 'El monto es requerido'
        }),
    
    expense_type: Joi.string()
        .valid('variable', 'fijo')
        .when('type', {
            is: 'expense',
            then: Joi.required().messages({
                'any.required': 'El tipo de gasto es requerido para gastos'
            }),
            otherwise: Joi.optional().allow(null, '')
        })
});

const filterSchema = Joi.object({
    month: Joi.number()
        .integer()
        .min(1)
        .max(12)
        .optional()
        .messages({
            'number.min': 'El mes debe estar entre 1 y 12',
            'number.max': 'El mes debe estar entre 1 y 12'
        }),
    year: Joi.number()
        .integer()
        .min(2000)
        .max(2100)
        .optional()
        .messages({
            'number.min': 'El ano debe ser valido',
            'number.max': 'El ano debe ser valido'
        })
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { 
            abortEarly: false,
            stripUnknown: true
        });
        
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({ 
                error: 'Validation failed',
                details: errors 
            });
        }
        
        req.validatedBody = value;
        next();
    };
};

// ============================================================
// ROUTES
// ============================================================

// Get transactions (with optional filters)
app.get('/api/transactions', async (req, res) => {
    try {
        const { error, value } = filterSchema.validate(req.query);
        
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({ 
                error: 'Invalid filters',
                details: errors 
            });
        }
        
        const { month, year } = value;
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
        console.error('Error fetching transactions:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add a transaction
app.post('/api/transactions', validateRequest(transactionSchema), async (req, res) => {
    try {
        const { type, description, category, amount, expense_type } = req.validatedBody;
        
        const result = await pool.query(
            'INSERT INTO transactions (type, description, category, amount, expense_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [type, description, category || null, amount, expense_type || null]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding transaction:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a transaction
app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ID is a number
        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }
        
        const result = await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        console.error('Error deleting transaction:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a transaction
app.put('/api/transactions/:id', validateRequest(transactionSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const { type, description, category, amount, expense_type } = req.validatedBody;
        
        // Validate ID
        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }
        
        const result = await pool.query(
            'UPDATE transactions SET type = $1, description = $2, category = $3, amount = $4, expense_type = $5 WHERE id = $6 RETURNING *',
            [type, description, category || null, amount, expense_type || null, id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating transaction:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================================
// SERVER START
// ============================================================

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
