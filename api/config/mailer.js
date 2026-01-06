import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para puerto 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Aquí usará "nipp oirb oxts xjee"
  },
});

transporter.verify().then(() => {
  console.log('✅ Listo para enviar correos');
}).catch(err => {
  console.error('❌ Error configuración correo:', err);
});

export const enviarCorreo = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: '"Soporte Fraganza 🌺" <axeladrian47555@gmail.com>', 
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error("Error enviando correo: ", error);
    return null;
  }
};