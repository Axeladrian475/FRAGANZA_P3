import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import paypalClient from '../config/paypal.js';
import { db } from '../config/bd.js'; // Importamos la conexión a la BD
import { CrearOrden } from '../controllers/bdController.js';
import { CapturarOrden } from '../controllers/bdController.js';

const router = express.Router();

// Ruta para CREAR una orden de pago (con validación de stock)
router.post('/create-order', CrearOrden);

// Ruta para CAPTURAR (finalizar) una orden y ACTUALIZAR STOCK
router.post('/capture-order', CapturarOrden);

export default router;