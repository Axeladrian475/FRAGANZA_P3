import paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configurar el entorno (Sandbox o Live)
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

// 2. Crear el cliente de PayPal
const client = new paypal.core.PayPalHttpClient(environment);

export default client;