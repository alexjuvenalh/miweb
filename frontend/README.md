# Frontend - Control Financiero

Interfaz de usuario modular para la aplicación de control financiero.

## Estructura

```
frontend/
├── src/
│   ├── api/
│   │   └── transactions.js   # Llamadas HTTP al backend
│   ├── state/
│   │   └── store.js         # Estado centralizado (Observer pattern)
│   ├── components/
│   │   ├── BalanceComponent.js      # Muestra totales
│   │   ├── TransactionFormComponent.js # Formularios de ingreso/gasto
│   │   ├── HistoryListComponent.js   # Lista de transacciones
│   │   ├── ChartsComponent.js        # Gráficos Chart.js
│   │   ├── SummaryComponent.js       # Resumen por categoría/tipo
│   │   ├── EditModalComponent.js     # Modal de edición
│   │   └── FilterComponent.js       # Filtros mes/año
│   ├── utils/
│   │   └── formatters.js   # Utilidades de formato
│   └── main.js             # Punto de entrada
├── index.html              # HTML principal (referencia al módulo)
└── README.md
```

## Arquitectura

### Patrón Observer (Store)

```javascript
// El store notifica a todos los componentes cuando cambia el estado
const store = new Store();

store.subscribe((state) => {
    // Se ejecuta cada vez que cambia el estado
    this.balance.render(state.totals);
});

// Actualizar estado
store.setState({ transactions: newData });
```

### Componentes Modularizados

Cada componente es una clase independiente que:
- Maneja su propio DOM
- Tiene callbacks configurables (`onEdit`, `onDelete`, etc.)
- Se comunica a través del store o callbacks

### API Layer

```javascript
// frontend/src/api/transactions.js
export const getTransactions = async (filters) => { ... };
export const createTransaction = async (data) => { ... };
export const updateTransaction = async (id, data) => { ... };
export const deleteTransaction = async (id) => { ... };
```

## Uso

El frontend usa ES Modules, por lo que debe servirse desde un servidor HTTP:

```bash
# Opción 1: Live Server (VS Code)
# Clic derecho en index.html > "Open with Live Server"

# Opción 2: Python
python -m http.server 8080

# Opción 3: Node
npx serve .
```

## Dependencias Externas

- **Chart.js** (CDN): Gráficos de dona y pastel
- **Font Lato** (Google Fonts): Tipografía

## Estados de la App

```javascript
store.state = {
    transactions: [],    // Lista de transacciones
    loading: false,      // Indicador de carga
    error: null,        // Mensaje de error
    filters: {           // Filtros activos
        month: null,
        year: null
    }
};
```
