import { db } from "../config/bd.js";

// 1. OBTENER
export const obtenerProductos = async (req, res) => {
  try {
    const [resultados] = await db.query("SELECT * FROM perfumes");
    res.json(resultados);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// 2. AGREGAR
export const agregarProducto = async (req, res) => {
  const { nombre, marca, precio, stock, descripcion } = req.body;
  
  // Guardamos la ruta relativa SIN barra inicial: images/archivo.jpg
  // Esto coincide con la ruta virtual '/images' que creamos en app.js
  const imagenUrl = req.file ? `images/${req.file.filename}` : null;

  try {
    const [result] = await db.execute(
      'INSERT INTO perfumes (nombre, marca, precio, stock, imagen, descripcion) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, marca, precio, stock, imagenUrl, descripcion || '']
    );
    res.status(201).json({ id: result.insertId, message: 'Producto agregado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al agregar" });
  }
};

// 3. ACTUALIZAR
export const actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, marca, precio, stock, descripcion } = req.body;
  
  let imagenUrl = req.body.imagen; 
  if (req.file) {
    // Si suben nueva foto, actualizamos la ruta (SIN barra inicial)
    imagenUrl = `images/${req.file.filename}`;
  }

  try {
    await db.execute(
      'UPDATE perfumes SET nombre=?, marca=?, precio=?, stock=?, imagen=?, descripcion=? WHERE id=?',
      [nombre, marca, precio, stock, imagenUrl, descripcion || '', id]
    );
    res.json({ message: 'Actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar" });
  }
};

// 4. ELIMINAR
export const eliminarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM perfumes WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar:", err);
    res.status(500).json({ error: "No se pudo eliminar el producto" });
  }
};