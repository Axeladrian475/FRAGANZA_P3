import { db } from '../config/bd.js';

export const crearPedido = async (req, res) => {
  const { usuario_id, total, productos, id_transaccion } = req.body;


  if (!usuario_id || !total || !productos || productos.length === 0) {
    return res.status(400).json({ message: 'Faltan datos del pedido.' });
  }

  try {
    const [resultPedido] = await db.execute(
      'INSERT INTO pedidos (usuario_id, total, id_transaccion_paypal) VALUES (?, ?, ?)',
      [usuario_id, total, id_transaccion]
    );

    const pedidoId = resultPedido.insertId;

    for (const p of productos) {
      await db.execute(
        'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedidoId, p.id, p.cantidad, p.precio]
      );

      await db.execute(
        'UPDATE perfumes SET stock = stock - ? WHERE id = ?',
        [p.cantidad, p.id]
      );
    }

    res.status(201).json({ message: 'Pedido guardado con éxito', pedidoId });

  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ message: 'Error interno al procesar el pedido.' });
  }
};