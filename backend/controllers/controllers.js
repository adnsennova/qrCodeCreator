const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const QRCode = require('qrcode');
const pool = require('../db/db.js')

// Ejemplo de base de datos en memoria para usuarios y QR
const users = [];
const qrs = [];

// Función para crear un usuario
exports.crear_usuario = async (req, res) => {
    const { correo, nombre, contrasena } = req.body;

    try {
        // Hash de la contraseña con bcrypt base 10
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        // Guardamos el usuario
        const [result] = await pool.execute(
            'INSERT INTO  usuarios (correo, nombre, contrasena) VALUES (?,?,?)',
            [correo,nombre, hashedPassword]
        );

        res.status(201).json({ message: 'Usuario creado', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario', error });
    }
};

// Función para validar un usuario
exports.validar_usuario = async (req, res) => {
    const { correo } = req.body;

    try {
        // Buscamos el usuario por correo
        const [rows] = await pool.execute(
            'SELECT contrasena FROM usuarios WHERE correo = ?',
            [correo]
        );

        if(rows.length === 0){
            return res.status(404).json({message: 'Usuario no encontrado'})
        }
        // Devolvemos la contraseña (hash) para validación en otro lado
        res.json({ contrasena: rows[0].contrasena });
    } catch (error) {
        res.status(500).json({ message: 'Error al validar usuario', error });
    }
};

// Función para crear un QR
exports.crear_qr = async (req, res) => {
    const { id_usuario, url, nombre_qr, color = '#000000', tamano = 300 } = req.body;

    try {
        // Buscamos el usuario
        const user = users.find(user => user.id === parseInt(id_usuario));
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Creamos la carpeta del usuario si no existe
        const userFolder = `../public/user_folder_${id_usuario}`;
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder);
        }

        // Ruta donde se guardará el QR
        const qrPath = path.join(userFolder, `${nombre_qr}.png`);

        // Generamos el código QR
        await QRCode.toFile(qrPath, url, {
            color: {
                dark: color,  // Color del QR
                light: '#FFFFFF'  // Fondo blanco
            },
            width: tamano
        });

        // Guardamos el QR en nuestro "array" de memoria
        qrs.push({ id_usuario, nombre_qr, path: qrPath });

        res.status(201).json({ message: 'QR creado', qrPath });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear QR', error });
    }
};

// Función para traer QR de un usuario
exports.traer_qr = async (req, res) => {
    const { id_usuario } = req.query;

    try {
        // Buscamos el usuario
        const user = users.find(user => user.id === parseInt(id_usuario));
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Buscamos los QR asociados al usuario
        const userQrs = qrs.filter(qr => qr.id_usuario === id_usuario);

        if (userQrs.length === 0) {
            return res.status(404).json({ message: 'No se encontraron QR para este usuario' });
        }

        res.json({ qrs: userQrs });
    } catch (error) {
        res.status(500).json({ message: 'Error al traer QR', error });
    }
};
