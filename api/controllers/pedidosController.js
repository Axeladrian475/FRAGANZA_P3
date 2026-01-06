import { db } from '../config/bd.js';

export const crearPedido = async (req, res) => {
    // Recibimos usuario, total y productos (id, cantidad, precio)
    const { usuario_id, total, productos } = req.body;

    if (!usuario_id || !productos || productos.length === 0) {
        return res.status(400).json({ message: "Faltan datos." });
    }

    try {
        // 1. Guardar el pedido principal
        const [result] = await db.query(
            "INSERT INTO pedidos (usuario_id, total, fecha, estado) VALUES (?, ?, NOW(), 'completado')", 
            [usuario_id, total]
        );
        
        const pedidoId = result.insertId;

        // 2. Guardar detalles y RESTAR STOCK
        for (const prod of productos) {
            // Insertar detalle
            await db.query(
                "INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)",
                [pedidoId, prod.id, prod.cantidad, prod.precio]
            );

            // Actualizar Stock (Aquí es donde se descuenta)
            await db.query(
                "UPDATE perfumes SET stock = stock - ? WHERE id = ?", 
                [prod.cantidad, prod.id]
            );
        }

        res.status(201).json({ message: "Pedido guardado y stock actualizado", id_pedido: pedidoId });

    } catch (error) {
        console.error("Error en crearPedido:", error);
        res.status(500).json({ message: "Error al procesar el pedido en la base de datos." });
    }
};