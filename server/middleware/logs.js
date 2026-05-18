import jwt from 'jsonwebtoken';
import db from '../db.js';
import { SECRET_KEY } from './auth.js';

export const logsMiddleware = (req, res, next) => {
  console.log('🔍 Middleware ejecutado para:', req.method, req.path);
  const originalJson = res.json;
  
  res.json = function(data) {
    const accionesImportantes = ['/register', '/generate', '/verify', '/admin/register', '/change-password'];

    console.log('Acción:', req.method, req.path, '| Incluida:', accionesImportantes.includes(req.path));

    if (accionesImportantes.includes(req.path) && req.method === 'POST') {
      let accion = '';
      let usuario_ci = 'desconocido';
      let rol = 'visitante';
      
      const token = req.headers['authorization']?.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, SECRET_KEY);
          usuario_ci = decoded.ci;
          rol = decoded.rol;
        } catch(e) {}
      }
      
      if (req.path === '/generate') {
        accion = data.success ? 'Inicio de sesión exitoso' : 'Intento fallido de inicio de sesión';
        if (data.success && data.user) {
          usuario_ci = data.user.ci || req.body?.email || 'desconocido';
          rol = data.user.rol?.toUpperCase() || 'visitante';
        } else {
          usuario_ci = req.body?.email || 'desconocido';
          rol = 'visitante';
        }
      }
      
      if (req.path === '/verify') {
        accion = data.success ? 'Verificación 2FA exitosa' : 'Código 2FA incorrecto';
        if (data.success && data.user) {
          usuario_ci = data.user.ci || req.body?.email || 'desconocido';
          rol = data.user.rol?.toUpperCase() || 'visitante';
        }
      }
      
      if (req.path === 'register') {
        usuario_ci = req.body?.ci || 'desconocido';
        accion = data.success ? 'Registro de nuevo cliente' : 'Intento fallido de registro';
      }
      
      if (req.path === '/register') {
        accion = data.success ? `Registro de ${req.body?.rol} exitoso` : 'Intento fallido de registro';
      }
      
      if (req.path === '/change-password') {
        accion = data.success ? 'Cambio de contraseña exitoso' : 'Intento fallido de cambio de contraseña';
      }
      
      const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
      const navegador = req.get('User-Agent') || 'desconocido';
      
      db.query(
        'INSERT INTO LOGS (usuario_ci, rol, accion, ip, navegador) VALUES (?, ?, ?, ?, ?)',
        [usuario_ci, rol, accion, ip, navegador],
        (err) => {
          if (err) console.error('❌ Error al guardar log:', err);
          else console.log('✅ Log guardado:', accion, usuario_ci);
        }
      );
    }
    
    originalJson.call(this, data);
  };
  
  next();
};