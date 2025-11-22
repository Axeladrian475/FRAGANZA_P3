import { db } from "../config/bd.js";
import paypal from '@paypal/checkout-server-sdk';
import paypalClient from '../config/paypal.js';
export const CrearOrden = async (req, res) => {

  const { productos } = req.body;

  try {
    //VALIDACIÓN DE STOCK EN EL SERVIDOR ===
    let total = 0;
    for (const item of productos) {
      const [rows] = await db.execute('SELECT nombre, precio, stock FROM perfumes WHERE id = ?', [item.producto.id]);
      if (rows.length === 0) {
        return res.status(404).send(`Producto con ID ${item.producto.id} no encontrado.`);
      }

      const perfume = rows[0];
      if (item.cantidad > perfume.stock) {
        return res.status(400).send(`Stock insuficiente para "${perfume.nombre}". Solo quedan ${perfume.stock} unidades.`);
      }
      total += perfume.precio * item.cantidad;
    }
    
    // Si la validación es exitosa, creamos la orden en PayPal
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'MXN',
          value: total.toFixed(2),
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

  const { orderID, productos } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);
    console.log('Pago capturado:', capture.result);

    //ACTUALIZACIÓN DE STOCK EN LA BASE DE DATOS ===
    // Usamos una transacción para asegurar que todas las actualizaciones se hagan o ninguna
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (const item of productos) {
        await connection.execute(
          'UPDATE perfumes SET stock = stock - ? WHERE id = ?',
          [item.cantidad, item.producto.id]
        );
      }
      await connection.commit();
      console.log('Stock actualizado correctamente.');
    } catch (dbError) {
      await connection.rollback();
      console.error('Error al actualizar stock, revirtiendo transacción:', dbError);
      // Aunque el pago se hizo, se debe notificar al admin para ajustar el stock manualmente
    } finally {
      connection.release();
    }

    res.json(capture.result);

  } catch (err) {
    console.error("Error al capturar la orden:", err);
    res.status(500).send("Error al confirmar el pago.");
  }
};
