import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { 
  obtenerProductos, 
  agregarProducto, 
  actualizarProducto, 
  eliminarProducto 
} from "../controllers/catalogoController.js";

// Necesitamos esto para calcular las rutas relativas correctamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// --- CONFIGURACIÓN DE MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // __dirname está en 'api/routes'. 
    // Subimos dos niveles (../../) para llegar a la raíz del proyecto y luego entramos a 'public/images'
    // Esto equivale a: C:\Users\axela\Desktop\WORKSPACE\FRAGANZA_V2\public\images
    cb(null, path.join(__dirname, '../../public/images')); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
// ----------------------------------------------------

router.get("/productos", obtenerProductos);
router.post("/productos", upload.single('imagen'), agregarProducto);
router.put("/productos/:id", upload.single('imagen'), actualizarProducto);
router.delete("/productos/:id", eliminarProducto);

export default router;