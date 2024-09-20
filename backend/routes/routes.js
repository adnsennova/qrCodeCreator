const express = require('express');
const router = express.Router();
const { crear_usuario, validar_usuario, crear_qr, traer_qr } = require('../controllers/controllers'); // Importamos las funciones del controlador

// Rutas
router.post('/crear_usuario', crear_usuario); // Ruta para crear un usuario
router.post('/validar_usuario', validar_usuario); // Ruta para validar un usuario
router.post('/crear_qr', crear_qr); // Ruta para crear un código QR
router.get('/traer_qr', traer_qr); // Ruta para traer los QR de un usuario

module.exports = router;
