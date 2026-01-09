// api/controllers/authController.js
import { db } from '../config/bd.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { enviarCorreo } from '../config/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

// 1. REGISTRO DE USUARIO
export const registrarUsuario = async (req, res) => {
    // 1. Recibir todos los datos solicitados
    const { nombre, apellido, username, email, password } = req.body;

    // VALIDACIÓN 1: Que no falte ningún dato
    if (!nombre || !email || !password) {
        return res.status(400).json({ message: "Nombre, email y contraseña son obligatorios." });
    }

    // VALIDACIÓN 2: Formato de correo electrónico correcto
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "El formato del correo electrónico no es válido." });
    }

    // VALIDACIÓN 3: Longitud de la contraseña
    if (password.length < 8) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
    }

    try {
        // VALIDACIÓN 4: Verificar duplicados (Email o Username)
        const [existingUser] = await db.query(
            'SELECT id FROM usuarios WHERE email = ? OR username = ?', 
            [email, username]
        );
        
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "El correo o el nombre de usuario ya están registrados." });
        }

        // Si pasa todas las validaciones, encriptamos la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Guardamos el nuevo usuario (usamos db.query para consistencia)
        // Aseguramos que apellido y username no sean null si no vienen
        const sql = "INSERT INTO usuarios (nombre, apellido, username, email, password, rol) VALUES (?, ?, ?, ?, ?, 'cliente')";
        await db.query(sql, [nombre, apellido || '', username || '', email, hashedPassword]);

        return res.status(201).json({ message: "Cuenta creada exitosamente." });

    } catch (error) {
        console.error("Error en registro:", error); 
        res.status(500).json({ message: "Error en el servidor al registrar usuario." });
    }
};

// 2. INICIO DE SESIÓN
export const loginUsuario = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Buscar usuario por email
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ message: 'Credenciales inválidas' });

        const usuario = rows[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) return res.status(400).json({ message: 'Credenciales inválidas' });

        // Generar Token
        const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, JWT_SECRET, { expiresIn: '1h' });

        // Enviar respuesta exitosa con todos los datos del usuario
        res.json({ 
            message: 'Login exitoso', 
            token, 
            usuario: { 
                id: usuario.id, 
                nombre: usuario.nombre, 
                apellido: usuario.apellido, 
                username: usuario.username, 
                email: usuario.email, 
                rol: usuario.rol 
            } 
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// 3. ACTUALIZAR PERFIL (COMPLETO)
export const actualizarPerfil = async (req, res) => {
    // Obtenemos el ID del middleware (req.user.id) y los datos del body
    const userId = req.user.id; 
    const { nombre, apellido, username, email } = req.body;

    try {
        // 1. Verificar si el nuevo email o username ya existen en OTRO usuario
        const sqlCheck = 'SELECT id FROM usuarios WHERE (email = ? OR username = ?) AND id != ?';
        const [existentes] = await db.query(sqlCheck, [email, username, userId]);

        if (existentes.length > 0) {
            return res.status(400).json({ message: 'El correo o el nombre de usuario ya están en uso por otra persona.' });
        }

        // 2. Actualizar todos los campos en la base de datos
        const sqlUpdate = 'UPDATE usuarios SET nombre = ?, apellido = ?, username = ?, email = ? WHERE id = ?';
        await db.query(sqlUpdate, [nombre, apellido, username, email, userId]);

        // 3. Devolver los datos actualizados para actualizar el frontend
        res.json({ 
            message: 'Perfil actualizado correctamente.',
            usuario: { id: userId, nombre, apellido, username, email } 
        });

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ message: "Error en el servidor al actualizar perfil." });
    }
};

// 4. SOLICITAR RECUPERACIÓN (Enviar correo con token)
export const solicitarRecuperacion = async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'No existe una cuenta con este correo.' });
    }

    const usuario = users[0];
    
    // Generar token temporal de 1 hora
    const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '1h' });

    // Guardar token en la BD (opcional pero recomendado para invalidarlo después)
    await db.query('UPDATE usuarios SET token_recuperacion = ? WHERE id = ?', [token, usuario.id]);

    // Enviar correo
    const link = `http://localhost:4200/restablecer?token=${token}`;
    await enviarCorreo(email, 'Recuperar Contraseña', 
      `<h1>Recuperación de Contraseña</h1>
       <p>Hola ${usuario.nombre}, has solicitado restablecer tu contraseña.</p>
       <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
       <a href="${link}">Restablecer Contraseña</a>
       <p>El enlace expira en 1 hora.</p>`
    );

    res.json({ message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al procesar la solicitud.' });
  }
};

// 5. RESTABLECER CONTRASEÑA
export const restablecerPassword = async (req, res) => {
  const { token, nuevoPassword } = req.body;

  try {
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevoPassword, salt);

    // Actualizar en BD y borrar el token de recuperación
    await db.query('UPDATE usuarios SET password = ?, token_recuperacion = NULL WHERE id = ?', [hashedPassword, decoded.id]);

    res.json({ message: '¡Contraseña actualizada! Ya puedes iniciar sesión.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'El enlace es inválido o ha expirado.' });
  }
};