import express from "express";
import multer from "multer";
import path from "path";
import { 
  obtenerProductos, 
  agregarProducto, 
  actualizarProducto, 
  eliminarProducto 
} from "../controllers/catalogoController.js";

const router = express.Router();

// --- CONFIGURACIÓN DE MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Guardamos en la carpeta 'uploads' dentro de 'api'
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Nombre único para evitar duplicados
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
// ------------------------------

router.get("/productos", obtenerProductos);
router.post("/productos", upload.single('imagen'), agregarProducto);
router.put("/productos/:id", upload.single('imagen'), actualizarProducto);
router.delete("/productos/:id", eliminarProducto);

export default router;