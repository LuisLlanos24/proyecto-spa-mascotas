import express from 'express';
import db from '../db.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// ==================== MASCOTAS ====================

// Registrar mascota (cliente)
router.post('/mascotas', verificarToken, (req, res) => {
  const { nombre, especie, raza, fecha_nac, peso, restricciones } = req.body;
  
  db.query(
    'INSERT INTO MASCOTA (nombre, especie, raza, fecha_nac, peso, restricciones, cod_cliente) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nombre, especie, raza, fecha_nac, peso, restricciones, req.user.ci],
    (err, result) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, message: 'Mascota registrada', cod_mascota: result.insertId });
    }
  );
});

// Listar mascotas del cliente
router.get('/mascotas', verificarToken, (req, res) => {
  db.query(
    'SELECT * FROM MASCOTA WHERE cod_cliente = ?',
    [req.user.ci],
    (err, results) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, mascotas: results });
    }
  );
});

// Obtener una mascota
router.get('/mascotas/:id', verificarToken, (req, res) => {
  db.query(
    'SELECT * FROM MASCOTA WHERE cod_mascota = ? AND cod_cliente = ?',
    [req.params.id, req.user.ci],
    (err, results) => {
      if (err || results.length === 0) return res.json({ success: false, message: 'Mascota no encontrada' });
      res.json({ success: true, mascota: results[0] });
    }
  );
});

// Actualizar mascota
router.put('/mascotas/:id', verificarToken, (req, res) => {
  const { nombre, especie, raza, fecha_nac, peso, restricciones } = req.body;
  
  db.query(
    'UPDATE MASCOTA SET nombre=?, especie=?, raza=?, fecha_nac=?, peso=?, restricciones=? WHERE cod_mascota=? AND cod_cliente=?',
    [nombre, especie, raza, fecha_nac, peso, restricciones, req.params.id, req.user.ci],
    (err) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, message: 'Mascota actualizada' });
    }
  );
});

// Eliminar mascota
router.delete('/mascotas/:id', verificarToken, (req, res) => {
  db.query(
    'DELETE FROM MASCOTA WHERE cod_mascota=? AND cod_cliente=?',
    [req.params.id, req.user.ci],
    (err) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, message: 'Mascota eliminada' });
    }
  );
});

// Historial de mascota
router.get('/mascotas/:id/historial', verificarToken, (req, res) => {
  db.query(
    'SELECT * FROM HISTORIAL_MASCOTA WHERE cod_mascota = ? ORDER BY fecha DESC',
    [req.params.id],
    (err, results) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, historial: results });
    }
  );
});

// Agregar evento al historial
router.post('/mascotas/:id/historial', verificarToken, (req, res) => {
  const { tipo_evento, descripcion, peso, fotos } = req.body;
  
  db.query(
    'INSERT INTO HISTORIAL_MASCOTA (fecha, tipo_evento, descripcion, peso, fotos, cod_mascota) VALUES (CURDATE(), ?, ?, ?, ?, ?)',
    [tipo_evento, descripcion, peso, fotos, req.params.id],
    (err) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, message: 'Evento registrado' });
    }
  );
});

// ==================== SERVICIOS ====================

// Listar servicios (público)
router.get('/servicios', (req, res) => {
  db.query('SELECT * FROM SERVICIO', (err, results) => {
    if (err) return res.json({ success: false, message: err.sqlMessage });
    res.json({ success: true, servicios: results });
  });
});

// Crear servicio (admin)
router.post('/servicios', verificarToken, (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR') return res.status(403).json({ success: false, message: 'No autorizado' });
  
  const { nombre, descripcion, precio_base, duracion } = req.body;
  
  db.query(
    'INSERT INTO SERVICIO (nombre, descripcion, precio_base, duracion) VALUES (?, ?, ?, ?)',
    [nombre, descripcion, precio_base, duracion],
    (err) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, message: 'Servicio creado' });
    }
  );
});

// ==================== CITAS ====================

// Agendar cita (cliente)
router.post('/citas', verificarToken, (req, res) => {
  const { cod_mascota, cod_servicio, fecha, hora, cod_empleado } = req.body;
  
  db.query(
    'INSERT INTO CITA (fecha, hora, estado, cod_cliente, cod_mascota, cod_empleado, cod_servicio) VALUES (?, ?, "pendiente", ?, ?, ?, ?)',
    [fecha, hora, req.user.ci, cod_mascota, cod_empleado, cod_servicio],
    (err) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, message: 'Cita agendada' });
    }
  );
});

// Listar citas del cliente
router.get('/citas', verificarToken, (req, res) => {
  let query;
  let params;
  
  if (req.user.rol === 'CLIENTE') {
    query = `
      SELECT c.*, m.nombre as mascota, s.nombre as servicio, u.nombre as empleado
      FROM CITA c
      JOIN MASCOTA m ON c.cod_mascota = m.cod_mascota
      JOIN SERVICIO s ON c.cod_servicio = s.cod_servicio
      LEFT JOIN USUARIO u ON c.cod_empleado = u.ci
      WHERE c.cod_cliente = ?
      ORDER BY c.fecha DESC, c.hora DESC
    `;
    params = [req.user.ci];
  } else if (req.user.rol === 'EMPLEADO') {
    query = `
      SELECT c.*, m.nombre as mascota, s.nombre as servicio, u.nombre as cliente
      FROM CITA c
      JOIN MASCOTA m ON c.cod_mascota = m.cod_mascota
      JOIN SERVICIO s ON c.cod_servicio = s.cod_servicio
      JOIN USUARIO u ON c.cod_cliente = u.ci
      WHERE c.cod_empleado = ?
      ORDER BY c.fecha DESC, c.hora DESC
    `;
    params = [req.user.ci];
  } else if (req.user.rol === 'ADMINISTRADOR') {
    query = `
      SELECT c.*, m.nombre as mascota, s.nombre as servicio, 
             u1.nombre as cliente, u2.nombre as empleado
      FROM CITA c
      JOIN MASCOTA m ON c.cod_mascota = m.cod_mascota
      JOIN SERVICIO s ON c.cod_servicio = s.cod_servicio
      JOIN USUARIO u1 ON c.cod_cliente = u1.ci
      LEFT JOIN USUARIO u2 ON c.cod_empleado = u2.ci
      ORDER BY c.fecha DESC, c.hora DESC
    `;
    params = [];
  }
  
  db.query(query, params, (err, results) => {
    if (err) return res.json({ success: false, message: err.sqlMessage });
    res.json({ success: true, citas: results });
  });
});

// Actualizar estado de cita
router.put('/citas/:id', verificarToken, (req, res) => {
  const { estado, puntuacion, comentario } = req.body;
  
  db.query(
    'UPDATE CITA SET estado=?, puntuacion=?, comentario=? WHERE cod_cita=?',
    [estado, puntuacion, comentario, req.params.id],
    (err) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, message: 'Cita actualizada' });
    }
  );
});

// Listar empleados disponibles
router.get('/empleados', verificarToken, (req, res) => {
  db.query(
    'SELECT u.ci, u.nombre, e.especialidad FROM USUARIO u JOIN EMPLEADO e ON u.ci = e.ci WHERE u.estado = "activo"',
    (err, results) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, empleados: results });
    }
  );
});

// Actualizar servicio
router.put('/servicios/:id', verificarToken, (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR') return res.status(403).json({ success: false, message: 'No autorizado' });
  
  const { nombre, descripcion, precio_base, duracion } = req.body;
  
  db.query(
    'UPDATE SERVICIO SET nombre=?, descripcion=?, precio_base=?, duracion=? WHERE cod_servicio=?',
    [nombre, descripcion, precio_base, duracion, req.params.id],
    (err) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, message: 'Servicio actualizado' });
    }
  );
});

// Eliminar servicio
router.delete('/servicios/:id', verificarToken, (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR') return res.status(403).json({ success: false, message: 'No autorizado' });
  
  db.query('DELETE FROM SERVICIO WHERE cod_servicio=?', [req.params.id], (err) => {
    if (err) return res.json({ success: false, message: err.sqlMessage });
    res.json({ success: true, message: 'Servicio eliminado' });
  });
});

// ==================== HORARIOS ====================

// Obtener horarios de la semana
router.get('/horarios', (req, res) => {
  db.query('SELECT * FROM HORARIO ORDER BY dia_semana, hora_inicio', (err, results) => {
    if (err) return res.json({ success: false, message: err.sqlMessage });
    res.json({ success: true, horarios: results });
  });
});

// Crear horario (admin/recepción)
router.post('/horarios', verificarToken, (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR' && req.user.rol !== 'EMPLEADO') {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  const { dia_semana, hora_inicio, hora_fin, tipo, descripcion } = req.body;
  
  db.query(
    'INSERT INTO HORARIO (dia_semana, hora_inicio, hora_fin, tipo, descripcion) VALUES (?, ?, ?, ?, ?)',
    [dia_semana, hora_inicio, hora_fin, tipo, descripcion],
    (err) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, message: 'Horario agregado' });
    }
  );
});

// Eliminar horario
router.delete('/horarios/:id', verificarToken, (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR') {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  db.query('DELETE FROM HORARIO WHERE cod_horario = ?', [req.params.id], (err) => {
    if (err) return res.json({ success: false, message: err.sqlMessage });
    res.json({ success: true, message: 'Horario eliminado' });
  });
});

// ==================== DISPONIBILIDAD ====================

// Obtener slots disponibles para una fecha y duración
router.get('/disponibilidad/:fecha/:duracion', verificarToken, (req, res) => {
  const { fecha, duracion } = req.params;
  const diaSemana = new Date(fecha).getDay() || 7; // 0=Domingo → 7
  
  // Obtener horarios laborales de ese día
  db.query(
    'SELECT * FROM HORARIO WHERE dia_semana = ? AND tipo = "laboral" ORDER BY hora_inicio',
    [diaSemana],
    (err, horarios) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      
      // Obtener citas ocupadas de esa fecha
      db.query(
        'SELECT c.hora, s.duracion FROM CITA c JOIN SERVICIO s ON c.cod_servicio = s.cod_servicio WHERE c.fecha = ? AND c.estado != "cancelada"',
        [fecha],
        (err, citasOcupadas) => {
          if (err) return res.json({ success: false, message: err.sqlMessage });
          
          const duracionMin = parseInt(duracion);
          const slotsDisponibles = [];
          
          horarios.forEach(h => {
            let horaActual = h.hora_inicio;
            const horaFin = h.hora_fin;
            
            while (horaActual < horaFin) {
              // Verificar si el slot está libre
              const slotOcupado = citasOcupadas.some(c => {
                const inicioCita = c.hora;
                const finCita = addMinutes(inicioCita, c.duracion);
                const finSlot = addMinutes(horaActual, duracionMin);
                return (horaActual < finCita && finSlot > inicioCita);
              });
              
              if (!slotOcupado && addMinutes(horaActual, duracionMin) <= horaFin) {
                slotsDisponibles.push(horaActual);
              }
              
              horaActual = addMinutes(horaActual, 30); // Avanzar 30 min
            }
          });
          
          res.json({ success: true, slots: slotsDisponibles });
        }
      );
    }
  );
});

// Función auxiliar para sumar minutos
function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m + parseInt(minutes), 0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// ==================== CAPACIDAD ====================

// Obtener capacidad para una fecha
router.get('/capacidad/:fecha', verificarToken, (req, res) => {
  db.query('SELECT * FROM CAPACIDAD_DIARIA WHERE fecha = ?', [req.params.fecha], (err, results) => {
    if (err) return res.json({ success: false, message: err.sqlMessage });
    
    const capacidad = results[0] || { max_servicios: 20 };
    
    // Contar citas agendadas ese día
    db.query(
      'SELECT COUNT(*) as total FROM CITA WHERE fecha = ? AND estado != "cancelada"',
      [req.params.fecha],
      (err, countResults) => {
        const ocupadas = countResults[0]?.total || 0;
        res.json({ 
          success: true, 
          capacidad: capacidad.max_servicios, 
          ocupadas,
          disponibles: capacidad.max_servicios - ocupadas
        });
      }
    );
  });
});

// Establecer capacidad diaria
router.post('/capacidad', verificarToken, (req, res) => {
  if (req.user.rol !== 'ADMINISTRADOR') {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  const { fecha, max_servicios } = req.body;
  
  db.query(
    'INSERT INTO CAPACIDAD_DIARIA (fecha, max_servicios) VALUES (?, ?) ON DUPLICATE KEY UPDATE max_servicios = ?',
    [fecha, max_servicios, max_servicios],
    (err) => {
      if (err) return res.json({ success: false, message: err.sqlMessage });
      res.json({ success: true, message: 'Capacidad actualizada' });
    }
  );
});

// ==================== AJUSTE POR MASCOTA ====================

// Calcular duración ajustada
router.post('/calcular-duracion', verificarToken, (req, res) => {
  const { cod_mascota, cod_servicio } = req.body;
  
  db.query(
    'SELECT duracion FROM SERVICIO WHERE cod_servicio = ?',
    [cod_servicio],
    (err, servResults) => {
      if (err || servResults.length === 0) return res.json({ success: false, message: 'Servicio no encontrado' });
      
      const duracionBase = servResults[0].duracion;
      
      db.query(
        'SELECT tamanio, temperamento FROM MASCOTA WHERE cod_mascota = ?',
        [cod_mascota],
        (err, mascResults) => {
          if (err || mascResults.length === 0) return res.json({ success: false, message: 'Mascota no encontrada' });
          
          const mascota = mascResults[0];
          let incremento = 0;
          
          switch(mascota.tamanio) {
            case 'pequeño': incremento = 0; break;
            case 'mediano': incremento = 0.10; break;
            case 'grande': incremento = 0.15; break;
            case 'gigante': incremento = 0.30; break;
          }
          
          if (mascota.temperamento === 'nervioso' || mascota.temperamento === 'agresivo') {
            incremento += 0.10;
          }
          
          const duracionAjustada = Math.ceil(duracionBase * (1 + incremento));
          
          res.json({ 
            success: true, 
            duracion_base: duracionBase,
            duracion_ajustada: duracionAjustada,
            incremento: `${Math.round(incremento * 100)}%`
          });
        }
      );
    }
  );
});

export default router;