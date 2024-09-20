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
            'INSERT INTO  users (correo, nombre, contrasena) VALUES (?,?,?)',
            [correo, nombre, hashedPassword]
        );

        res.status(201).json({ message: 'Usuario creado', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario', error });
    }
};

// Función para validar un usuario
exports.validar_usuario = async (req, res) => {
    const { correo, contrasena } = req.body; // También recibimos la contraseña ingresada por el usuario

    try {
        // Buscamos el usuario por correo y obtenemos contrasena, id, nombre, y correo
        const [rows] = await pool.execute(
            'SELECT contrasena, id, nombre, correo FROM users WHERE correo = ?',
            [correo]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Comparar la contraseña ingresada con el hash almacenado
        const validPassword = await bcrypt.compare(contrasena, rows[0].contrasena);

        if (!validPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta', status: 401 });
        }

        // Verificar los valores antes de enviarlos
        console.log('ID:', rows[0].id);        // Asegúrate de que este valor es el ID y no el correo
        console.log('Correo:', rows[0].correo); // Verificar que este es el correo correcto

        // Si la contraseña es correcta, enviamos los datos correctos
        res.json({
            message: "Inicio de sesión exitoso",
            userId: rows[0].id,     // Aquí debe ir el ID, asegúrate que es el ID correcto
            nombre: rows[0].nombre,
            correo: rows[0].correo, // Enviamos también el correo si es necesario
            status: 200
        });
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
