import { db } from "../config/bd.js";
import paypal from '@paypal/checkout-server-sdk';
import paypalClient from '../config/paypal.js';

export const CrearOrden = async (req, res) => {
  const { productos } = req.body;

  try {
    let subtotal = 0;
    
    // 1. Calcular subtotal real desde la base de datos (seguridad)
    for (const item of productos) {
      const [rows] = await db.execute('SELECT nombre, precio, stock FROM perfumes WHERE id = ?', [item.producto.id]);
      
      if (rows.length === 0) {
        return res.status(404).send(`Producto con ID ${item.producto.id} no encontrado.`);
      }

      const perfume = rows[0];
      if (item.cantidad > perfume.stock) {
        return res.status(400).send(`Stock insuficiente para "${perfume.nombre}".`);
      }
      
      subtotal += parseFloat(perfume.precio) * item.cantidad;
    }

    // 2. AGREGAR IVA (16%) AL COBRO DE PAYPAL
    const totalConIVA = subtotal * 1.16;
    const value = totalConIVA.toFixed(2); // Formato 0.00

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'MXN',
          value: value,
        },
      }],
    });

    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });

  } catch (err) {
    console.error("Error al crear la orden:", err);
    res.status(500).send("Error al crear la orden de pago.");
  }
};

export const CapturarOrden = async (req, res) => {
  const { orderID } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);
    // Solo retornamos éxito. La BD y el Stock se actualizan en el siguiente paso (crearPedido)
    res.json(capture.result);

  } catch (err) {
    console.error("Error al capturar la orden:", err);
    res.status(500).send("Error al capturar el pago.");
  }
};