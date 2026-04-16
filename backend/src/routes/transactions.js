/**
 * Rutas para el CRUD de transacciones
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { 
    createTransactionSchema, 
    filterSchema, 
    idSchema,
    validateRequest, 
    validateQuery,
    validateParams 
} = require('../validators/transaction');

/**
 * GET /api/transactions
 * Obtiene todas las transacciones con filtros opcionales por mes/año
 */
router.get('/', validateQuery(filterSchema), async (req, res) => {
    try {
        const { month, year } = req.validatedQuery;
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
        
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * GET /api/transactions/:id
 * Obtiene una transacción por ID
 */
router.get('/:id', validateParams(idSchema), async (req, res) => {
    try {
        const { id } = req.validatedParams;
        
        const result = await db.query(
            'SELECT * FROM transactions WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching transaction:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * POST /api/transactions
 * Crea una nueva transacción
 */
router.post('/', validateRequest(createTransactionSchema), async (req, res) => {
    try {
        const { type, description, category, amount, expense_type } = req.validatedBody;
        
        const result = await db.query(
            `INSERT INTO transactions (type, description, category, amount, expense_type) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [type, description, category || null, amount, expense_type || null]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding transaction:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * PUT /api/transactions/:id
 * Actualiza una transacción existente
 */
router.put('/:id', validateParams(idSchema), validateRequest(createTransactionSchema), async (req, res) => {
    try {
        const { id } = req.validatedParams;
        const { type, description, category, amount, expense_type } = req.validatedBody;
        
        const result = await db.query(
            `UPDATE transactions 
             SET type = $1, description = $2, category = $3, amount = $4, expense_type = $5 
             WHERE id = $6 RETURNING *`,
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

/**
 * DELETE /api/transactions/:id
 * Elimina una transacción
 */
router.delete('/:id', validateParams(idSchema), async (req, res) => {
    try {
        const { id } = req.validatedParams;
        
        const result = await db.query(
            'DELETE FROM transactions WHERE id = $1',
            [id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        console.error('Error deleting transaction:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
