// api/routes/authRoutes.js
import express from 'express';
import { 
  registrarUsuario, 
  loginUsuario, 
  solicitarRecuperacion, 
  restablecerPassword,
  actualizarPerfil 
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/recuperar', solicitarRecuperacion);
router.post('/restablecer', restablecerPassword);

// Ruta protegida (Requiere Token)
router.put('/perfil', verifyToken, actualizarPerfil);

export default router;