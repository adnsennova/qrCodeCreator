const express = require('express');
const router = express.Router();
const isAuthenticated = require("../midleware/auth");
const { crear_usuario, validar_usuario, crear_qr, traer_qr } = require('../controllers/controllers'); // Importamos las funciones del controlador

// Rutas
router.post('/crear_usuario', crear_usuario); // Ruta para crear un usuario (no requiere autenticación)
router.post('/validar_usuario', validar_usuario); // Ruta para validar un usuario (no requiere autenticación)
router.post('/crear_qr', isAuthenticated, crear_qr); // Ruta para crear un código QR (requiere autenticación)
router.get('/traer_qr', isAuthenticated, traer_qr); // Ruta para traer los QR de un usuario (requiere autenticación)

module.exports = router;
