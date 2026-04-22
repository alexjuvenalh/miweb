const db = require('./backend/src/config/database');

async function test() {
  const result = await db.query(
    "SELECT * FROM transactions WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2",
    [1, 2026]
  );
  console.log('Filas encontradas para enero 2026:', result.rows.length);
  console.log(result.rows);
  process.exit();
}

test();