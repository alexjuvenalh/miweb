/**
 * Backend - Control Financiero
 * 
 * API REST modular para gestión de transacciones financieras
 */

const app = require('./src/app');
const db = require('./src/config/database');

module.exports = {
    app,
    db
};
