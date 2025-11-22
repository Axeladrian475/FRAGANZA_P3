import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import catalogoRoutes from './routes/catalogoRouters.js';
import pedidosRoutes from './routes/pedidosRoutes.js';
import authRoutes from './routes/authRoutes.js'; 

// --- ESTOS SON LOS IMPORTS QUE FALTABAN PARA CORREGIR EL ERROR ---
import path from 'path';
import { fileURLToPath } from 'url';
// ---------------------------------------------------------------

dotenv.config();

// --- AQUÍ CREAMOS LA VARIABLE __dirname MANUALMENTE ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// -----------------------------------------------------

const app = express();

app.use(cors());
app.use(express.json());

// --- AHORA SÍ PODEMOS USAR __dirname AQUÍ ---
// Hacemos pública la carpeta uploads para que se vean las fotos
app.use('/images', express.static(path.join(__dirname, '../public/images')));
// === RUTAS ===
app.use('/api', catalogoRoutes);
app.use('/api/orders', pedidosRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});