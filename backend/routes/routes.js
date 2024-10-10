const express = require('express');
const router = express.Router();
const isAuthenticated = require("../midleware/auth");
const { crear_usuario, validar_usuario, crear_qr, traer_qr, obtener_qrs, eliminar_qr, traer_usuario } = require('../controllers/controllers'); // Importamos las funciones del controlador

// Rutas
router.post('/crear_usuario', crear_usuario); // Ruta para crear un usuario (no requiere autenticación)
router.post('/validar_usuario', validar_usuario); // Ruta para validar un usuario (no requiere autenticación)
router.post('/crear_qr', crear_qr); // Ruta para crear un código QR (requiere autenticación)
router.get('/traer_qr', traer_qr); // Ruta para traer los QR de un usuario (requiere autenticación)
router.get('/traer-usuario/:id_usuario', traer_usuario); // Ruta para traer los QR de un usuario (requiere autenticación)
router.get('/qrs/:id_usuario', obtener_qrs);
router.delete('/qrs/:id', eliminar_qr);

module.exports = router;
