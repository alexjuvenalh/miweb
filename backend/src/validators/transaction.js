/**
 * Schemas de validación Joi para transacciones
 */

const Joi = require('joi');

/**
 * Schema para crear/actualizar una transacción
 */
const createTransactionSchema = Joi.object({
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

/**
 * Schema para validar filtros de consulta
 */
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

/**
 * Schema para validar ID de transacción
 */
const idSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID debe ser un numero',
            'number.integer': 'El ID debe ser un numero entero',
            'number.positive': 'El ID debe ser positivo',
            'any.required': 'El ID es requerido'
        })
});

/**
 * Middleware para validar el body de la request
 */
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

/**
 * Middleware para validar query parameters
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, { 
            abortEarly: false,
            stripUnknown: true
        });
        
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({ 
                error: 'Invalid filters',
                details: errors 
            });
        }
        
        req.validatedQuery = value;
        next();
    };
};

/**
 * Middleware para validar params
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, { 
            abortEarly: false
        });
        
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({ 
                error: 'Invalid parameters',
                details: errors 
            });
        }
        
        req.validatedParams = value;
        next();
    };
};

module.exports = {
    createTransactionSchema,
    filterSchema,
    idSchema,
    validateRequest,
    validateQuery,
    validateParams
};
