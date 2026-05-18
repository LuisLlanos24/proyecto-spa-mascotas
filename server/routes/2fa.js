import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { SECRET_KEY } from '../middleware/auth.js';
import { enviarEmail } from '../email.js';

const router = express.Router();

// Generar código 2FA
router.post('/generate', async (req, res) => {
  const { email, contrasena } = req.body;
  
  db.query('SELECT * FROM USUARIO WHERE email = ?', [email], async (err, results) => {
    if (results.length === 0) {
      return res.json({ success: false, message: 'Credenciales inválidas' });
    }
    
    const user = results[0];
    
    // Verificar bloqueo
    if (user.bloqueado_hasta) {
      const ahora = new Date();
      const bloqueo = new Date(user.bloqueado_hasta);
      if (bloqueo > ahora) {
        const mins = Math.ceil((bloqueo - ahora) / 60000);
        return res.json({ success: false, message: `Cuenta bloqueada. Intente en ${mins} minutos` });
      } else {
        db.query('UPDATE USUARIO SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE ci = ?', [user.ci]);
        user.intentos_fallidos = 0;
      }
    }
    
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    
    if (!validPassword) {
      const nuevosIntentos = (user.intentos_fallidos || 0) + 1;
      if (nuevosIntentos >= 5) {
        const bloqueoHasta = new Date(Date.now() + 15 * 60 * 1000);
        db.query('UPDATE USUARIO SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE ci = ?', [nuevosIntentos, bloqueoHasta, user.ci]);
        return res.json({ success: false, message: 'Cuenta bloqueada por 15 minutos' });
      } else {
        db.query('UPDATE USUARIO SET intentos_fallidos = ? WHERE ci = ?', [nuevosIntentos, user.ci]);
        return res.json({ success: false, message: `Contraseña incorrecta. Intento ${nuevosIntentos} de 5` });
      }
    }
    
    db.query('UPDATE USUARIO SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE ci = ?', [user.ci]);
    
    // Login directo o 2FA
    if (user.rol.toUpperCase() !== 'ADMINISTRADOR' || !user.dos_pasos) {
      const tokenPayload = { ci: user.ci, rol: user.rol.toUpperCase() };
      if (user.primer_login) tokenPayload.primerLogin = true;
      
      const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: user.primer_login ? '30m' : '24h' });
      
      delete user.contrasena;
      user.rol = user.rol.toUpperCase();
      
      return res.json({ success: true, user, token, necesita2FA: false, mustChangePassword: user.primer_login || false });
    }
    
    // Generar código 2FA
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = new Date(Date.now() + 10 * 60 * 1000);
    
    db.query('UPDATE USUARIO SET codigo_2fa = ?, codigo_2fa_expiracion = ? WHERE ci = ?', [codigo, expiracion, user.ci]);
    
    await enviarEmail(email, codigo);
    
    res.json({ success: true, message: 'Código enviado', necesita2FA: true, email, user: { ci: user.ci, rol: user.rol.toUpperCase() } });
  });
});

// Verificar código 2FA
router.post('/verify', (req, res) => {
  const { email, codigo } = req.body;
  
  db.query('SELECT * FROM USUARIO WHERE email = ?', [email], (err, results) => {
    if (results.length === 0) return res.json({ success: false, message: 'Usuario no encontrado' });
    
    const user = results[0];
    
    if (new Date() > new Date(user.codigo_2fa_expiracion)) {
      return res.json({ success: false, message: 'Código expirado' });
    }
    
    if (user.codigo_2fa !== codigo) {
      return res.json({ success: false, message: 'Código incorrecto' });
    }
    
    db.query('UPDATE USUARIO SET codigo_2fa = NULL, codigo_2fa_expiracion = NULL WHERE ci = ?', [user.ci]);
    
    const tokenPayload = { ci: user.ci, rol: user.rol.toUpperCase() };
    if (user.primer_login) tokenPayload.primerLogin = true;
    
    const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: user.primer_login ? '30m' : '24h' });
    
    delete user.contrasena;
    delete user.codigo_2fa;
    delete user.codigo_2fa_expiracion;
    user.rol = user.rol.toUpperCase();
    
    res.json({ success: true, user, token, mustChangePassword: user.primer_login || false });
  });
});

export default router;