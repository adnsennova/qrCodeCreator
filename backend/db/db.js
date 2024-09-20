const mysql = require('mysql2');

// Crear la conexión con la base de datos MySQL
const pool = mysql.createPool({
  host: 'localhost',      // Cambiar si tu base de datos no está local
  user: 'root',           // Usuario de MySQL
  password: '',   // Contraseña del usuario MySQL
  database: 'qr_db',  // Nombre de tu base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exportar el pool de conexiones para que se use en el resto del proyecto
module.exports = pool.promise();
