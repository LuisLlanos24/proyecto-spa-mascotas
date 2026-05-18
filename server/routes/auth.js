import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { SECRET_KEY, verificarToken } from '../middleware/auth.js';
import { enviarEmail } from '../email.js';

const router = express.Router();

// REGISTER (público - solo clientes)
router.post('/register', async (req, res) => {
  const { ci, nombre, email, contrasena, telefono, direccion, sexo, edad } = req.body;
  
  db.query('SELECT ci FROM USUARIO WHERE ci = ?', [ci], async (err, results) => {
    if (results.length > 0) return res.json({ success: false, message: 'CI ya registrado' });
    
    db.query('SELECT email FROM USUARIO WHERE email = ?', [email], async (err, emailResults) => {
      if (emailResults.length > 0) return res.json({ success: false, message: 'Email ya registrado' });

          db.query('SELECT telefono FROM USUARIO WHERE telefono = ?', [telefono], async (err, telefonoResults) => {
            if (telefonoResults.length > 0) return res.json({ success: false, message: 'Teléfono ya registrado' });

      
      
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      
      db.query(
        'INSERT INTO USUARIO (ci, nombre, email, contrasena, telefono, direccion, sexo, edad, fecha_registro, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)',
        [ci, nombre, email, hashedPassword, telefono, direccion, sexo, edad, 'CLIENTE'],
        (err) => {
          if (err) return res.json({ success: false, message: err.sqlMessage });
          db.query('INSERT INTO CLIENTE (ci, pts_fidelidad) VALUES (?, 0)', [ci]);
          res.json({ success: true, message: 'Cliente registrado exitosamente' });
        }
      );
      });
    });
  });
});

// CAMBIAR CONTRASEÑA (primer login)
router.post('/change-password', verificarToken, async (req, res) => {
  const { newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  db.query(
    'UPDATE USUARIO SET contrasena = ?, primer_login = FALSE, contrasena_temporal = NULL WHERE ci = ?',
    [hashedPassword, req.user.ci],
    (err) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      
      const token = jwt.sign(
        { ci: req.user.ci, rol: req.user.rol },
        SECRET_KEY,
        { expiresIn: '24h' }
      );
      
      res.json({ success: true, message: 'Contraseña actualizada', token });
    }
  );
});

export default router;