import { db } from "../config/bd.js";

export const obtenerProductos = async (req, res) => {
  try {
    const [resultados] = await db.query("SELECT * FROM perfumes");
    res.json(resultados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error" });
  }
};

export const agregarProducto = async (req, res) => {
  const { nombre, marca, precio, stock, descripcion } = req.body;
  
  // Guardamos ruta relativa
  const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.execute(
      'INSERT INTO perfumes (nombre, marca, precio, stock, imagen, descripcion) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, marca, precio, stock, imagenUrl, descripcion || '']
    );
    res.status(201).json({ id: result.insertId, message: 'Agregado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al agregar" });
  }
};

export const actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, marca, precio, stock, descripcion } = req.body;
  
  let imagenUrl = req.body.imagen; 
  if (req.file) {
    imagenUrl = `/uploads/${req.file.filename}`;
  }

  try {
    await db.execute(
      'UPDATE perfumes SET nombre=?, marca=?, precio=?, stock=?, imagen=?, descripcion=? WHERE id=?',
      [nombre, marca, precio, stock, imagenUrl, descripcion || '', id]
    );
    res.json({ message: 'Actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar" });
  }
};

export const eliminarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM perfumes WHERE id = ?', [id]);
    res.json({ message: 'Eliminado' });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
};