import express from 'express';
// Importamos la lógica de base de datos y de PayPal
import { crearPedido } from '../controllers/pedidosController.js'; 
import { CrearOrden, CapturarOrden } from '../controllers/bdController.js';

const router = express.Router();

// 1. Ruta para GUARDAR el pedido en BD y actualizar Stock
// Se accede como: POST http://localhost:4000/api/orders/
router.post('/', crearPedido);

// 2. Rutas de PayPal
router.post('/create-order', CrearOrden);
router.post('/capture-order', CapturarOrden);

export default router;