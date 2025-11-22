import express from 'express';
// AQUÍ ESTABA EL ERROR: Faltaba agregar solicitarRecuperacion y restablecerPassword
import { 
  registrarUsuario, 
  loginUsuario, 
  solicitarRecuperacion, 
  restablecerPassword 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);

// Rutas de Recuperación
router.post('/recuperar', solicitarRecuperacion);
router.post('/restablecer', restablecerPassword);

export default router;