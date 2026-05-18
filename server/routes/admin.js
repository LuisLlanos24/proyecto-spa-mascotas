import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { verificarToken } from '../middleware/auth.js';
import { enviarEmail } from '../email.js';

const router = express.Router();

// REGISTRO POR ADMIN
router.post('/register', verificarToken, async (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR') {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  const { ci, nombre, email, telefono, direccion, sexo, edad, rol, especialidad, horario } = req.body;
  
  db.query('SELECT ci FROM USUARIO WHERE ci = ?', [ci], async (err, results) => {
    if (results.length > 0) return res.json({ success: false, message: 'CI ya registrado' });
    
    db.query('SELECT email FROM USUARIO WHERE email = ?', [email], async (err, emailResults) => {
      if (emailResults.length > 0) return res.json({ success: false, message: 'Email ya registrado' });

          db.query('SELECT telefono FROM USUARIO WHERE telefono = ?', [telefono], async (err, telefonoResults) => {
            if (telefonoResults.length > 0) return res.json({ success: false, message: 'Teléfono ya registrado' });
      
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedTemp = await bcrypt.hash(tempPassword, 10);
      
      db.query(
        'INSERT INTO USUARIO (ci, nombre, email, contrasena, telefono, direccion, sexo, edad, fecha_registro, rol, primer_login, contrasena_temporal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, TRUE, ?)',
        [ci, nombre, email, hashedTemp, telefono, direccion, sexo, edad, rol, tempPassword],
        (err) => {
          if (err) return res.json({ success: false, message: err.sqlMessage });
          
          if (rol === 'EMPLEADO') {
            db.query('INSERT INTO EMPLEADO (ci, especialidad, horario, fecha_contratacion) VALUES (?, ?, ?, CURDATE())', [ci, especialidad, horario]);
          } else if (rol === 'ADMINISTRADOR') {
            db.query('INSERT INTO ADMINISTRADOR (ci, fecha_contratacion) VALUES (?, CURDATE())', [ci]);
          }
          
          enviarEmail(email, null, { nombre, ci, contrasena: tempPassword, rol });
          
          res.json({ success: true, message: `${rol} registrado exitosamente. Credenciales enviadas al email.` });
        }
      );
      });
    });
  });
});

// LISTAR USUARIOS
router.get('/users', verificarToken, (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR') {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  db.query('SELECT ci, nombre, email, rol, estado, dos_pasos, fecha_registro FROM USUARIO ORDER BY fecha_registro DESC', (err, results) => {
    if (err) return res.json({ success: false, message: err.sqlMessage });
    res.json({ success: true, users: results });
  });
});

// MODIFICAR USUARIO
router.put('/users/:ci', verificarToken, (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR') return res.status(403).json({ success: false, message: 'No autorizado' });
  
  const { nombre, email, telefono, direccion, sexo, edad, rol, especialidad, horario } = req.body;
  
  db.query('UPDATE USUARIO SET nombre=?, email=?, telefono=?, direccion=?, sexo=?, edad=?, rol=? WHERE ci=?',
    [nombre, email, telefono, direccion, sexo, edad, rol, req.params.ci],
    (err) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      
      if (rol === 'EMPLEADO') {
        db.query('UPDATE EMPLEADO SET especialidad=?, horario=? WHERE ci=?', [especialidad, horario, req.params.ci]);
      }
      
      res.json({ success: true, message: 'Usuario actualizado' });
    }
  );
});

// ACTIVAR/DESACTIVAR USUARIO
router.put('/users/:ci/status', verificarToken, (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR') return res.status(403).json({ success: false, message: 'No autorizado' });
  
  db.query('UPDATE USUARIO SET estado = ? WHERE ci = ?', [req.body.estado, req.params.ci], (err) => {
    if (err) return res.json({ success: false, message: err.sqlMessage });
    res.json({ success: true, message: `Usuario ${req.body.estado === 'activo' ? 'activado' : 'desactivado'}` });
  });
});

// TOGGLE 2FA (propio admin)
router.put('/2fa/toggle', verificarToken, (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR') return res.status(403).json({ success: false, message: 'No autorizado' });
  
  db.query('SELECT dos_pasos FROM USUARIO WHERE ci = ?', [req.user.ci], (err, results) => {
    if (err || results.length === 0) return res.json({ success: false, message: 'Error' });
    
    const nuevoEstado = !results[0].dos_pasos;
    db.query('UPDATE USUARIO SET dos_pasos = ? WHERE ci = ?', [nuevoEstado, req.user.ci], (err) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, dos_pasos: nuevoEstado, message: `2FA ${nuevoEstado ? 'activado' : 'desactivado'}` });
    });
  });
});

// TOGGLE 2FA para cualquier usuario
router.put('/users/:ci/2fa', verificarToken, (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR') return res.status(403).json({ success: false, message: 'No autorizado' });
  
  db.query('UPDATE USUARIO SET dos_pasos = ? WHERE ci = ?', [req.body.activar, req.params.ci], (err) => {
    if (err) return res.json({ success: false, message: err.sqlMessage });
    res.json({ success: true, message: `2FA ${req.body.activar ? 'activado' : 'desactivado'}` });
  });
});

// VER LOGS
router.get('/logs', verificarToken, (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR') return res.status(403).json({ success: false, message: 'No autorizado' });
  
  db.query('SELECT * FROM LOGS ORDER BY fecha DESC LIMIT 100', (err, results) => {
    if (err) return res.json({ success: false, message: err.sqlMessage });
    res.json({ success: true, logs: results });
  });
});

export default router;