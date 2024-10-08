const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/routes');

const app = express();

// Configurar el middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));
// Configurar CORS para permitir cookies
app.use(cors({
  origin: '*', // Reemplaza con la URL de tu frontend
  credentials: true
}));

// Usar cookie-parser middleware
app.use(cookieParser());

app.use(express.json());

// Configurar opciones de cookie globales (si es necesario)
app.use((req, res, next) => {
  res.cookie('testCookie', 'testValue', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  next();
});

// Usa las rutas
app.use('/api', routes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});