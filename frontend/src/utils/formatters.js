/**
 * Utilidades de formateo para la aplicación
 */

const CURRENCY_SYMBOL = 'S/';

/**
 * Formatea un monto como moneda peruana
 * @param {number} amount - Monto a formatear
 * @param {number} decimals - Cantidad de decimales (default: 2)
 * @returns {string} Monto formateado
 */
const formatCurrency = (amount, decimals = 2) => {
    return `${CURRENCY_SYMBOL} ${parseFloat(amount).toFixed(decimals)}`;
};

/**
 * Formatea una fecha ISO a formato local español
 * @param {string} dateStr - Fecha ISO
 * @returns {string} Fecha formateada
 */
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Formatea una fecha para input datetime-local
 * @param {string} dateStr - Fecha ISO
 * @returns {string} Fecha formateada para input
 */
const formatDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
};

/**
 * Obtiene el nombre del mes en español
 * @param {number} month - Número de mes (1-12)
 * @returns {string} Nombre del mes
 */
const getMonthName = (month) => {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril',
        'Mayo', 'Junio', 'Julio', 'Agosto',
        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || '';
};

/**
 * Obtiene el año actual
 * @returns {number} Año actual
 */
const getCurrentYear = () => new Date().getFullYear();

/**
 * Obtiene los años disponibles (últimos 5 años)
 * @returns {Array<number>} Array de años
 */
const getAvailableYears = () => {
    const currentYear = getCurrentYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
};

/**
 * Clases CSS según tipo de transacción
 * @param {string} type - 'income' o 'expense'
 * @returns {string} Clases CSS
 */
const getTypeClasses = (type) => {
    return type === 'income' ? 'plus' : 'minus';
};

/**
 * Valida que un monto sea válido
 * @param {*} amount - Valor a validar
 * @returns {boolean} true si es válido
 */
const isValidAmount = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 1000000;
};

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

export {
    formatCurrency,
    formatDate,
    formatDateForInput,
    getMonthName,
    getCurrentYear,
    getAvailableYears,
    getTypeClasses,
    isValidAmount,
    escapeHtml
};
