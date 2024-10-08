const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const QRCode = require('qrcode');
const pool = require('../db/db.js');
const { log } = require('console');
const { URL } = require('url');
const https = require('https');
const http = require('http');


// Ejemplo de base de datos en memoria para usuarios y QR
const users = [];
const qrs = [];

// Función para validar la URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}

// Función para verificar si la URL existe
function urlExists(url) {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
            if (res.statusCode === 200) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).on('error', () => {
            resolve(false);
        });
    });
}

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


exports.crear_qr = async (req, res) => {
    const { id_usuario, url, nombre_qr, color = '#000000' } = req.body;
    console.log(id_usuario, url, nombre_qr, color);
    
    try {
        // Verificar si el usuario existe
        const [userRows] = await pool.execute(
            'SELECT id FROM users WHERE id = ?',
            [id_usuario]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Generar el código QR
        const qrOptions = {
            color: {
                dark: color,
                light: '#ffffff'
            }
        };

        // Crear directorio para QRs si no existe
        const qrDirectory = path.join(__dirname, '..', 'public', 'qrs');
        await fs.mkdir(qrDirectory, { recursive: true });

        // Generar nombre único para el archivo
        const fileName = `${Date.now()}-${nombre_qr}.png`;
        const filePath = path.join(qrDirectory, fileName);
        
        // Generar el QR
        await QRCode.toFile(filePath, url, qrOptions);

        // Insertar el nuevo QR en la base de datos
        const [result] = await pool.execute(
            'INSERT INTO qrs (nombre, url, color, id_usuario, qr_path) VALUES (?, ?, ?, ?, ?)',
            [nombre_qr, url, color, id_usuario, `/qrs/${fileName}`]
        );

        // Respuesta exitosa
        res.status(201).json({
            message: 'QR creado y almacenado en la base de datos',
            qr: { 
                nombre: nombre_qr, 
                url, 
                color, 
                id_usuario 
            },
            id: result.insertId,
            qrPath: `/qrs/${fileName}`
        });

    } catch (error) {
        console.error('Error en crear_qr:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: 'El usuario especificado no existe o la relación de clave foránea es inválida' });
        }
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
