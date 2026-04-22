# Mejoras Pendientes - Sistema de Control Financiero

Este documento detalla las funcionalidades y mejoras técnicas necesarias para transformar el prototipo actual en una aplicación robusta, segura y profesional.

## 🚀 Funcionalidades de Negocio (Prioridad Alta)

### 1. Gestión de Periodos y Filtros
*   **Filtros de Tiempo:** Implementar selectores para visualizar transacciones por Mes Actual, Año o Rangos personalizados.
*   **Presupuestos Mensuales:** Permitir al usuario establecer un límite de gasto por categoría (ej. "Alimentos: S/ 500") y mostrar indicadores visuales de consumo.
*   **Edición de Registros:** Añadir la capacidad de modificar transacciones existentes (actualmente solo permite crear y eliminar).

### 2. Análisis y Reportes
*   **Gráficos de Tendencia:** Incluir un gráfico de líneas (Chart.js) que muestre la evolución del saldo neto a lo largo del tiempo.
*   **Exportación de Datos:** Botones para descargar el historial en formatos **PDF** (reporte mensual) o **Excel** (datos crudos).
*   **Resumen de Ahorro:** Calcular automáticamente el porcentaje de ahorro mensual respecto a los ingresos totales.

## 🛠️ Robustez Técnica y Seguridad

### 3. Backend y Base de Datos
*   **Autenticación de Usuarios:** Implementar un sistema de Login/Registro (JWT o Sesiones) para que cada usuario tenga su propia base de datos privada.
*   **Validación de Esquema:** Usar librerías como `Joi` o `Zod` en el servidor para asegurar que los datos recibidos (montos, fechas, categorías) sean válidos antes de tocar la BD.
*   **Manejo de Errores Profesional:** Implementar un middleware global de errores en Express que devuelva respuestas JSON estandarizadas en lugar de fallos genéricos.

### 4. Frontend y Experiencia de Usuario (UX)
*   **Sincronización en Tiempo Real:** Implementar indicadores de carga (*spinners*) y notificaciones visuales (Toast) cuando una operación (Guardar/Eliminar) sea exitosa o falle.
*   **Validación de Saldo Negativo:** Alertar al usuario mediante un modal si un gasto nuevo superará el saldo disponible actual.
*   **Diseño Adaptativo Extremo:** Optimizar la tabla de historial para dispositivos móviles (vista de tarjetas en pantallas pequeñas).

## 📈 Mantenimiento y Calidad de Código

### 5. DevOps y Estándares
*   **Pruebas Automatizadas:** Añadir tests unitarios para la lógica de cálculo de saldos y tests de integración para los endpoints de la API.
*   **Documentación de API:** Crear un archivo `swagger.yaml` o una colección de Postman para documentar el uso de los endpoints `/api/transactions`.
*   **Scripts de Despliegue:** Configurar un `Dockerfile` para facilitar el despliegue del servidor y la base de datos en cualquier entorno.

---
*Documento generado el 10/04/2026 para la hoja de ruta del proyecto Financiero.*
