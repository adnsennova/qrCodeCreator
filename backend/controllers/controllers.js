const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
// const QRCode = require('qrcode');
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

exports.validar_usuario = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // Validar que se recibieron los datos necesarios
        if (!correo || !contrasena) {
            return res.status(400).json({
                message: 'Correo y contraseña son requeridos',
                status: 400
            });
        }

        // Buscar el usuario
        const [rows] = await pool.execute(
            'SELECT contrasena, id, nombre, correo FROM users WHERE correo = ?',
            [correo]
        );

        // Si no se encuentra el usuario
        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Usuario no encontrado',
                status: 404
            });
        }

        // Verificar la contraseña
        const validPassword = await bcrypt.compare(contrasena, rows[0].contrasena);

        if (!validPassword) {
            return res.status(401).json({
                message: 'Contraseña incorrecta',
                status: 401
            });
        }

        // Verificar que tenemos todos los datos necesarios
        const userData = rows[0];
        if (!userData.id || !userData.nombre || !userData.correo) {
            return res.status(500).json({
                message: 'Error en los datos del usuario',
                status: 500
            });
        }

        // Si todo está correcto, enviar respuesta exitosa
        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            userId: userData.id,
            nombre: userData.nombre,
            correo: userData.correo,
            status: 200
        });

    } catch (error) {
        console.error('Error en validar_usuario:', error);
        return res.status(500).json({
            message: 'Error interno del servidor',
            status: 500
        });
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

        // Verificar si ya existe un QR con el mismo nombre para este usuario
        const [qrRows] = await pool.execute(
            'SELECT * FROM qrs WHERE nombre = ? AND id_usuario = ?',
            [nombre_qr, id_usuario]
        );

        if (qrRows.length > 0) {
            return res.status(400).json({ message: `Ya existe un QR con el nombre "${nombre_qr}" para este usuario.` });
        }

        // Insertar la información del QR en la base de datos
        const [result] = await pool.execute(
            'INSERT INTO qrs (nombre, url, color, id_usuario) VALUES (?, ?, ?, ?)',
            [nombre_qr, url, color, id_usuario]
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
        });

    } catch (error) {
        console.error('Error en crear_qr:', error);
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
exports.traer_usuario = async (req, res) => {
    const { id_usuario } = req.params;

    if (!id_usuario) {
        return res.status(400).json({ message: `No se recibió un ID válido` });
    }

    try {
        const [rows] = await pool.execute(
            'SELECT id, nombre, correo FROM users WHERE id = ?',
            [id_usuario]
        );

        if (rows.length > 0) {
            return res.status(200).json({
                message: `Se encontró el usuario con el ID => ${id_usuario}`,
                id: id_usuario,
                data: rows[0],
            });
        } else {
            return res.status(404).json({ message: `Usuario no encontrado` });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Error en la base de datos',
            error: error.message,
        });
    }
};


exports.obtener_qrs = async (req, res) => {
    const { id_usuario } = req.params;  // Suponemos que el id_usuario viene en los parámetros de la URL

    try {
        // Consultar todos los QRs del usuario especificado
        const [qrRows] = await pool.execute(
            'SELECT * FROM qrs WHERE id_usuario = ?',
            [id_usuario]
        );

        if (qrRows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron QRs para este usuario.' });
        }

        // Respuesta exitosa con los registros encontrados
        res.status(200).json({
            message: 'QRs obtenidos exitosamente',
            qrs: qrRows
        });

    } catch (error) {
        console.error('Error al obtener QRs:', error);
        res.status(500).json({ message: 'Error al obtener QRs', error });
    }
};

exports.eliminar_qr = async (req, res) => {
    const { id } = req.params;  // Suponemos que el ID del QR viene en los parámetros de la URL
    console.log(`id recibido en backend: ${id}`);

    try {
        // Ejecutar la consulta para eliminar el QR
        const [result] = await pool.execute(
            'DELETE FROM qrs WHERE id = ?',
            [id]
        );

        // Verificar si se eliminó alguna fila
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No se encontró el QR con el ID especificado.' });
        }

        // Respuesta exitosa
        res.status(200).json({
            message: 'QR eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar el QR:', error);
        res.status(500).json({ message: 'Error al eliminar el QR', error });
    }
};
