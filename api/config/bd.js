import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Exportamos la conexión para poder importarla en otros archivos
export const db = mysql.createPool({ // Usamos createPool para manejar múltiples conexiones
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "perfumeria",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection()
  .then(connection => {
    console.log("✅ Conectado a la base de datos MySQL");
    connection.release();
  })
  .catch(err => {
    console.error("❌ Error al conectar a la base de datos:", err);
  });