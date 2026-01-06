import express from 'express';
// Agregamos 'obtenerHistorial' a la importación
import { crearPedido, obtenerHistorial } from '../controllers/pedidosController.js'; 
import { CrearOrden, CapturarOrden } from '../controllers/bdController.js';

const router = express.Router();

// Rutas existentes
router.post('/', crearPedido);
router.post('/create-order', CrearOrden);
router.post('/capture-order', CapturarOrden);

// --- NUEVA RUTA ---
// GET /api/orders/usuario/:usuario_id
router.get('/usuario/:usuario_id', obtenerHistorial);

export default router;