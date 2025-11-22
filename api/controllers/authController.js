// api/controllers/authController.js
import { db } from '../config/bd.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { enviarCorreo } from '../config/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

// ------------------------------------------------------------------
// 1. REGISTRO DE USUARIO
// ------------------------------------------------------------------
export const registrarUsuario = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificar si existe
    const [existingUser] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // Encriptar password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Guardar en BD
    await db.execute(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hashedPassword]
    );

    res.status(201).json({ message: 'Usuario registrado con éxito.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al registrar usuario.' });
  }
};

// ------------------------------------------------------------------
// 2. INICIO DE SESIÓN (LOGIN)
// ------------------------------------------------------------------
export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    const usuario = rows[0];
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // Token
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al iniciar sesión.' });
  }
};

// ------------------------------------------------------------------
// 3. SOLICITAR RECUPERACIÓN
// ------------------------------------------------------------------
export const solicitarRecuperacion = async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Correo no registrado.' });
    }

    const usuario = rows[0];
    const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '1h' });
    
    // Guardar token en BD
    await db.execute('UPDATE usuarios SET token_recuperacion = ? WHERE id = ?', [token, usuario.id]);

    const link = `${process.env.FRONTEND_URL}/restablecer/${token}`;

    await enviarCorreo({
      to: email,
      subject: "Recupera tu acceso a Fraganza",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Hola ${usuario.nombre},</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el botón de abajo para crear una nueva:</p>
          <a href="${link}" style="background-color: #d63384; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Si no fuiste tú, ignora este mensaje. El enlace expira en 1 hora.</p>
        </div>
      `
    });

    res.json({ message: 'Correo enviado. Revisa tu bandeja de entrada.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar correo.' });
  }
};

// ------------------------------------------------------------------
// 4. RESTABLECER CONTRASEÑA
// ------------------------------------------------------------------
export const restablecerPassword = async (req, res) => {
  const { token, nuevoPassword } = req.body;

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'El enlace ha expirado o es inválido.' });
    }

    const [rows] = await db.execute('SELECT * FROM usuarios WHERE id = ? AND token_recuperacion = ?', [decoded.id, token]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Token inválido o ya utilizado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevoPassword, salt);

    await db.execute('UPDATE usuarios SET password = ?, token_recuperacion = NULL WHERE id = ?', [hashedPassword, decoded.id]);

    res.json({ message: '¡Contraseña actualizada! Ya puedes iniciar sesión.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cambiar la contraseña.' });
  }
};