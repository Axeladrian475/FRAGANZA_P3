import express from 'express';
// AQUÍ ESTABA EL ERROR: Faltaba agregar solicitarRecuperacion y restablecerPassword
import { 
  registrarUsuario, 
  loginUsuario, 
  solicitarRecuperacion, 
  restablecerPassword,
  actualizarPerfil // <--- IMPORTAR ESTO
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);

// Rutas de Recuperación
router.post('/recuperar', solicitarRecuperacion);
router.post('/restablecer', restablecerPassword);

router.put('/perfil', verifyToken, actualizarPerfil);
export default router;