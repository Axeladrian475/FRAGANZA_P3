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

// ... (código anterior de crearPedido) ...

// NUEVA FUNCIÓN: Obtener historial
export const obtenerHistorial = async (req, res) => {
    const { usuario_id } = req.params;

    try {
        // Hacemos una consulta "JOIN" para traer el pedido y los nombres de los perfumes en una sola llamada
        const sql = `
            SELECT 
                p.id as pedido_id, 
                p.fecha, 
                p.total, 
                p.estado,
                dp.cantidad, 
                dp.precio as precio_unitario,
                per.nombre as nombre_producto, 
                per.imagen
            FROM pedidos p
            JOIN detalles_pedido dp ON p.id = dp.pedido_id
            JOIN perfumes per ON dp.producto_id = per.id
            WHERE p.usuario_id = ?
            ORDER BY p.fecha DESC
        `;

        const [rows] = await db.query(sql, [usuario_id]);

        // Como la consulta devuelve una fila por cada producto, vamos a agruparlos por pedido
        // para que te quede algo ordenado como: [{ id: 1, productos: [...] }, { id: 2... }]
        const historial = Object.values(rows.reduce((acc, row) => {
            if (!acc[row.pedido_id]) {
                acc[row.pedido_id] = {
                    id: row.pedido_id,
                    fecha: row.fecha,
                    total: row.total,
                    estado: row.estado,
                    productos: []
                };
            }
            acc[row.pedido_id].productos.push({
                nombre: row.nombre_producto,
                cantidad: row.cantidad,
                precio: row.precio_unitario,
                imagen: row.imagen
            });
            return acc;
        }, {}));

        res.json(historial);

    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ message: "Error al cargar el historial." });
    }
};