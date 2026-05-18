import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  'tus credenciales',          
  'tus credenciales',      
  'tus credenciales'
);

oauth2Client.setCredentials({
  refresh_token: 'tus credenciales'
});

export async function enviarEmail(destinatario, codigo = null, credenciales = null) {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'tus credenciales',
        clientId: 'tus credenciales',
        clientSecret: 'tus credenciales',
        refreshToken: 'tus credenciales',
        accessToken: accessToken.token
      }
    });
    
    let subject, html;
    
    if (credenciales) {
      subject = '🔐 Tus credenciales - Veterinaria SPA';
      html = `
        <h3>Bienvenido ${credenciales.nombre}</h3>
        <p>Rol: <strong>${credenciales.rol}</strong></p>
        <p>CI: <strong>${credenciales.ci}</strong></p>
        <p>Contraseña temporal: <strong>${credenciales.contrasena}</strong></p>
        <p>Al iniciar sesión, deberás cambiar tu contraseña.</p>
      `;
    } else {
      subject = '🔐 Código de verificación';
      html = `<h2>Tu código es: ${codigo}</h2><p>Expira en 10 minutos</p>`;
    }
    
    await transporter.sendMail({
      from: 'Veterinaria SPA <etcymasetc@gmail.com>',
      to: destinatario,
      subject,
      html
    });
    
    console.log(`📧 Email enviado a ${destinatario}`);
    return true;
  } catch (error) {
    console.error('Error al enviar email:', error);
    return false;
  }
}