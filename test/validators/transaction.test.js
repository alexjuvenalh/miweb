/**
 * Tests Unitarios - Validadores de Transacciones
 * Valida los schemas Joi y los middlewares de validación
 */

const Joi = require('joi');
const {
    createTransactionSchema,
    filterSchema,
    idSchema,
    validateRequest,
    validateQuery,
    validateParams
} = require('../../backend/src/validators/transaction');

describe('Validators - Schemas Joi', () => {
    
    // ============================================================
    // CREATE TRANSACTION SCHEMA - INGRESOS
    // ============================================================
    
    describe('createTransactionSchema - Ingresos', () => {
        const validIncome = {
            type: 'income',
            description: 'Salario mensual',
            amount: 5000
        };

        test('DEBE aceptar un ingreso válido', () => {
            const { error, value } = createTransactionSchema.validate(validIncome);
            expect(error).toBeUndefined();
            expect(value.type).toBe('income');
        });

        test('DEBE aceptar ingreso con cantidad decimal', () => {
            const { error } = createTransactionSchema.validate({
                ...validIncome,
                amount: 1500.50
            });
            expect(error).toBeUndefined();
        });

        test('DEBE rechazar tipo inválido', () => {
            const { error } = createTransactionSchema.validate({
                ...validIncome,
                type: 'invalid'
            });
            expect(error).toBeDefined();
            expect(error.details[0].message).toContain('income');
        });

        test('DEBE rechazar tipo vacio', () => {
            const { error } = createTransactionSchema.validate({
                ...validIncome,
                type: ''
            });
            expect(error).toBeDefined();
        });

        test('DEBE rechazar monto negativo', () => {
            const { error } = createTransactionSchema.validate({
                ...validIncome,
                amount: -100
            });
            expect(error).toBeDefined();
            expect(error.details[0].message).toContain('positivo');
        });

        test('DEBE rechazar monto cero', () => {
            const { error } = createTransactionSchema.validate({
                ...validIncome,
                amount: 0
            });
            expect(error).toBeDefined();
        });

        test('DEBE rechazar monto mayor al límite', () => {
            const { error } = createTransactionSchema.validate({
                ...validIncome,
                amount: 2000000
            });
            expect(error).toBeDefined();
            expect(error.details[0].message).toContain('1,000,000');
        });

        test('DEBE rechazar descripción vacía', () => {
            const { error } = createTransactionSchema.validate({
                ...validIncome,
                description: ''
            });
            expect(error).toBeDefined();
        });

        test('DEBE rechazar descripción muy larga', () => {
            const { error } = createTransactionSchema.validate({
                ...validIncome,
                description: 'a'.repeat(501)
            });
            expect(error).toBeDefined();
            expect(error.details[0].message).toContain('500');
        });
    });

    // ============================================================
    // CREATE TRANSACTION SCHEMA - GASTOS
    // ============================================================
    
    describe('createTransactionSchema - Gastos', () => {
        const validExpense = {
            type: 'expense',
            description: 'Almuerzo',
            category: 'alimentacion',
            amount: 25,
            expense_type: 'variable'
        };

        test('DEBE aceptar un gasto válido con todos los campos', () => {
            const { error, value } = createTransactionSchema.validate(validExpense);
            expect(error).toBeUndefined();
            expect(value.type).toBe('expense');
            expect(value.category).toBe('alimentacion');
        });

        test('DEBE rechazar gasto sin categoría', () => {
            const { error } = createTransactionSchema.validate({
                ...validExpense,
                category: undefined
            });
            expect(error).toBeDefined();
            expect(error.details[0].message).toContain('categoria');
        });

        test('DEBE rechazar gasto sin tipo de gasto', () => {
            const { error } = createTransactionSchema.validate({
                ...validExpense,
                expense_type: undefined
            });
            expect(error).toBeDefined();
            expect(error.details[0].message).toContain('tipo de gasto');
        });

        test('DEBE aceptar gasto tipo fijo', () => {
            const { error } = createTransactionSchema.validate({
                ...validExpense,
                expense_type: 'fijo'
            });
            expect(error).toBeUndefined();
        });

        test('DEBE rechazar tipo de gasto inválido', () => {
            const { error } = createTransactionSchema.validate({
                ...validExpense,
                expense_type: 'lujoso'
            });
            expect(error).toBeDefined();
        });
    });

    // ============================================================
    // FILTER SCHEMA
    // ============================================================
    
    describe('filterSchema', () => {
        
        test('DEBE aceptar objeto vacío (sin filtros)', () => {
            const { error } = filterSchema.validate({});
            expect(error).toBeUndefined();
        });

        test('DEBE aceptar mes válido', () => {
            const { error, value } = filterSchema.validate({ month: 6 });
            expect(error).toBeUndefined();
            expect(value.month).toBe(6);
        });

        test('DEBE aceptar año válido', () => {
            const { error } = filterSchema.validate({ year: 2026 });
            expect(error).toBeUndefined();
        });

        test('DEBE aceptar mes y año juntos', () => {
            const { error } = filterSchema.validate({ month: 3, year: 2025 });
            expect(error).toBeUndefined();
        });

        test('DEBE rechazar mes menor a 1', () => {
            const { error } = filterSchema.validate({ month: 0 });
            expect(error).toBeDefined();
        });

        test('DEBE rechazar mes mayor a 12', () => {
            const { error } = filterSchema.validate({ month: 13 });
            expect(error).toBeDefined();
        });

        test('DEBE rechazar año menor a 2000', () => {
            const { error } = filterSchema.validate({ year: 1999 });
            expect(error).toBeDefined();
        });

        test('DEBE rechazar año mayor a 2100', () => {
            const { error } = filterSchema.validate({ year: 2101 });
            expect(error).toBeDefined();
        });

        test('DEBE rechazar valores no numéricos', () => {
            const { error } = filterSchema.validate({ month: 'abc' });
            expect(error).toBeDefined();
        });
    });

    // ============================================================
    // ID SCHEMA
    // ============================================================
    
    describe('idSchema', () => {
        
        test('DEBE aceptar ID válido', () => {
            const { error, value } = idSchema.validate({ id: 123 });
            expect(error).toBeUndefined();
            expect(value.id).toBe(123);
        });

        test('DEBE rechazar ID cero', () => {
            const { error } = idSchema.validate({ id: 0 });
            expect(error).toBeDefined();
        });

        test('DEBE rechazar ID negativo', () => {
            const { error } = idSchema.validate({ id: -5 });
            expect(error).toBeDefined();
        });

        test('DEBE rechazar ID no entero', () => {
            const { error } = idSchema.validate({ id: 1.5 });
            expect(error).toBeDefined();
        });

        test('DEBE rechazar ID no numérico', () => {
            const { error } = idSchema.validate({ id: 'abc' });
            expect(error).toBeDefined();
        });

        test('DEBE rechazar ID faltante', () => {
            const { error } = idSchema.validate({});
            expect(error).toBeDefined();
        });
    });
});

describe('Validators - Middlewares', () => {
    
    // Mock de response
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
    
    // Mock de next
    const next = jest.fn();

    describe('validateRequest middleware', () => {
        
        test('DEBE continuar si la validación es exitosa', () => {
            const req = { body: { type: 'income', description: 'Test', amount: 100 } };
            const middleware = validateRequest(createTransactionSchema);
            
            middleware(req, res, next);
            
            expect(next).toHaveBeenCalled();
            expect(req.validatedBody).toBeDefined();
            expect(req.validatedBody.type).toBe('income');
        });

        test('DEBE retornar 400 si la validación falla', () => {
            const req = { body: { type: 'invalid' } };
            const middleware = validateRequest(createTransactionSchema);
            
            middleware(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation failed',
                    details: expect.any(Array)
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        test('DEBE sanitizar campos desconocidos', () => {
            const req = { 
                body: { 
                    type: 'income', 
                    description: 'Test', 
                    amount: 100,
                    unknownField: 'should be removed'
                } 
            };
            const middleware = validateRequest(createTransactionSchema);
            
            middleware(req, res, next);
            
            expect(req.validatedBody.unknownField).toBeUndefined();
        });
    });

    describe('validateQuery middleware', () => {
        
        test('DEBE continuar con query válida', () => {
            const req = { query: { month: '5' } };
            const middleware = validateQuery(filterSchema);
            
            // Nota: Joi convierte strings a números si el schema lo define como number
            middleware(req, res, next);
            
            expect(next).toHaveBeenCalled();
        });

        test('DEBE retornar 400 con query inválida', () => {
            const req = { query: { month: 'invalid' } };
            const middleware = validateQuery(filterSchema);
            
            middleware(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('validateParams middleware', () => {
        
        test('DEBE continuar con params válidos', () => {
            const req = { params: { id: '123' } };
            const middleware = validateParams(idSchema);
            
            middleware(req, res, next);
            
            expect(next).toHaveBeenCalled();
            expect(req.validatedParams).toBeDefined();
        });

        test('DEBE retornar 400 con params inválidos', () => {
            const req = { params: { id: '-5' } };
            const middleware = validateParams(idSchema);
            
            middleware(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });
});