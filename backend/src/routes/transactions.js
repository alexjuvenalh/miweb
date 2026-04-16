/**
 * Rutas para el CRUD de transacciones
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const logger = require('../utils/logger');
const { Errors } = require('../middlewares/errorHandler');
const { 
    createTransactionSchema, 
    filterSchema, 
    idSchema,
    validateRequest, 
    validateQuery,
    validateParams 
} = require('../validators/transaction');

// Logger específico para este módulo
const log = logger.createLogger('Transactions');

// ============================================================
// GET /api/transactions
// Obtiene todas las transacciones con filtros opcionales por mes/año
// ============================================================
router.get('/', validateQuery(filterSchema), async (req, res, next) => {
    try {
        const { month, year } = req.validatedQuery;
        
        log.info('Obteniendo transacciones', { filters: { month, year } });
        
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
        
        log.info(`Transacciones encontradas: ${result.rows.length}`);
        res.json(result.rows);
    } catch (err) {
        log.error('Error al obtener transacciones', { error: err.message });
        next(Errors.DATABASE_ERROR('Error al consultar transacciones'));
    }
});

// ============================================================
// GET /api/transactions/:id
// Obtiene una transacción por ID
// ============================================================
router.get('/:id', validateParams(idSchema), async (req, res, next) => {
    try {
        const { id } = req.validatedParams;
        
        log.info(`Obteniendo transacción ${id}`);
        
        const result = await db.query(
            'SELECT * FROM transactions WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            throw Errors.NOT_FOUND('Transacción');
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === 'NOT_FOUND') {
            next(err);
        } else {
            log.error('Error al obtener transacción', { error: err.message });
            next(Errors.DATABASE_ERROR('Error al consultar transacción'));
        }
    }
});

// ============================================================
// POST /api/transactions
// Crea una nueva transacción
// ============================================================
router.post('/', validateRequest(createTransactionSchema), async (req, res, next) => {
    try {
        const { type, description, category, amount, expense_type } = req.validatedBody;
        
        log.info('Creando transacción', { type, description, amount });
        
        const result = await db.query(
            `INSERT INTO transactions (type, description, category, amount, expense_type) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [type, description, category || null, amount, expense_type || null]
        );
        
        log.success(`Transacción creada: ID ${result.rows[0].id}`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        log.error('Error al crear transacción', { error: err.message });
        next(Errors.DATABASE_ERROR('Error al crear transacción'));
    }
});

// ============================================================
// PUT /api/transactions/:id
// Actualiza una transacción existente
// ============================================================
router.put('/:id', validateParams(idSchema), validateRequest(createTransactionSchema), async (req, res, next) => {
    try {
        const { id } = req.validatedParams;
        const { type, description, category, amount, expense_type } = req.validatedBody;
        
        log.info(`Actualizando transacción ${id}`, { type, amount });
        
        const result = await db.query(
            `UPDATE transactions 
             SET type = $1, description = $2, category = $3, amount = $4, expense_type = $5 
             WHERE id = $6 RETURNING *`,
            [type, description, category || null, amount, expense_type || null, id]
        );
        
        if (result.rowCount === 0) {
            throw Errors.NOT_FOUND('Transacción');
        }
        
        log.success(`Transacción ${id} actualizada`);
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === 'NOT_FOUND') {
            next(err);
        } else {
            log.error('Error al actualizar transacción', { error: err.message });
            next(Errors.DATABASE_ERROR('Error al actualizar transacción'));
        }
    }
});

// ============================================================
// DELETE /api/transactions/:id
// Elimina una transacción
// ============================================================
router.delete('/:id', validateParams(idSchema), async (req, res, next) => {
    try {
        const { id } = req.validatedParams;
        
        log.info(`Eliminando transacción ${id}`);
        
        const result = await db.query(
            'DELETE FROM transactions WHERE id = $1',
            [id]
        );
        
        if (result.rowCount === 0) {
            throw Errors.NOT_FOUND('Transacción');
        }
        
        log.success(`Transacción ${id} eliminada`);
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        if (err.code === 'NOT_FOUND') {
            next(err);
        } else {
            log.error('Error al eliminar transacción', { error: err.message });
            next(Errors.DATABASE_ERROR('Error al eliminar transacción'));
        }
    }
});

module.exports = router;
