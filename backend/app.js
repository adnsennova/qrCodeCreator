const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser'); // Importa cookie-parser
const app = express();
const routes = require('./routes/routes'); // Asegúrate de importar tus rutas

// Middleware para analizar las cookies
app.use(cors());
app.use(cookieParser());
app.use(express.json()); // Si estás usando JSON en tus solicitudes

// Usa las rutas
app.use('/api', routes); // Cambia '/api' por el prefijo que necesites

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
