const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes'); // Importamos las rutas definidas en routes.js
const app = express();

// Middleware
app.use(cors()); // Configura CORS
app.use(express.json()); // Parseo de JSON

// Rutas
app.use('/api', routes); // Usamos las rutas definidas en routes.js con prefijo '/api'

// Inicialización del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
