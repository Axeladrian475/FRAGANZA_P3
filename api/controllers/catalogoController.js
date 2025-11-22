import { db } from "../config/bd.js";

// 1. OBTENER TODOS LOS PRODUCTOS (Ya lo tenías)
export const obtenerProductos = async (req, res) => {
  try {
    const [resultados] = await db.query("SELECT * FROM perfumes");
    res.json(resultados);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// 2. AGREGAR UN NUEVO PRODUCTO
export const agregarProducto = async (req, res) => {
  // Multer pone el archivo en req.file y los textos en req.body
  const { nombre, marca, precio, stock, descripcion } = req.body;
  
  // Si se subió imagen, creamos la URL completa. Si no, null.
const imagenUrl = req.file ? `/images/${req.file.filename}` : null;
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

// 3. ACTUALIZAR UN PRODUCTO EXISTENTE
export const actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, marca, precio, stock, descripcion } = req.body;
  
  // Lógica para la imagen:
  // 1. Si hay archivo nuevo (req.file), usamos ese.
  // 2. Si no hay archivo nuevo, intentamos mantener el anterior (que viene en req.body.imagen si el frontend lo manda).
  let imagenUrl = req.body.imagen; 
  if (req.file) {
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

// 4. ELIMINAR UN PRODUCTO
export const eliminarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute('DELETE FROM perfumes WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: "No se pudo eliminar el producto" });
  }
};