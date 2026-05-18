import { useState, useEffect } from 'react';

const API = 'http://localhost:3001/api/citas';

function AgendarCita() {
  const [mascotas, setMascotas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState({
    cod_mascota: '', cod_servicio: '', fecha: '', hora: '', cod_empleado: ''
  });

  useEffect(() => {
    // Cargar mascotas
    fetch(`${API}/mascotas`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(data => {
      if (data.success) setMascotas(data.mascotas);
    });

    // Cargar servicios
    fetch(`${API}/servicios`).then(res => res.json()).then(data => {
      if (data.success) setServicios(data.servicios);
    });

    // Cargar empleados
    fetch(`${API}/empleados`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(data => {
      if (data.success) setEmpleados(data.empleados);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const res = await fetch(`${API}/citas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    
    if (data.success) {
      alert('Cita agendada exitosamente');
      setForm({ cod_mascota: '', cod_servicio: '', fecha: '', hora: '', cod_empleado: '' });
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">📅 Agendar Nueva Cita</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Mascota</label>
            <select 
              className="form-control" 
              value={form.cod_mascota}
              onChange={(e) => setForm({...form, cod_mascota: e.target.value})}
              required
            >
              <option value="">Seleccionar mascota</option>
              {mascotas.map(m => (
                <option key={m.cod_mascota} value={m.cod_mascota}>{m.nombre} ({m.especie})</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Servicio</label>
            <select 
              className="form-control"
              value={form.cod_servicio}
              onChange={(e) => setForm({...form, cod_servicio: e.target.value})}
              required
            >
              <option value="">Seleccionar servicio</option>
              {servicios.map(s => (
                <option key={s.cod_servicio} value={s.cod_servicio}>
                  {s.nombre} - ${s.precio_base} ({s.duracion} min)
                </option>
              ))}
            </select>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Fecha</label>
              <input 
                type="date" 
                className="form-control"
                value={form.fecha}
                onChange={(e) => setForm({...form, fecha: e.target.value})}
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Hora</label>
              <input 
                type="time" 
                className="form-control"
                value={form.hora}
                onChange={(e) => setForm({...form, hora: e.target.value})}
                required 
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Empleado (opcional)</label>
            <select 
              className="form-control"
              value={form.cod_empleado}
              onChange={(e) => setForm({...form, cod_empleado: e.target.value})}
            >
              <option value="">Sin preferencia</option>
              {empleados.map(e => (
                <option key={e.ci} value={e.ci}>{e.nombre} - {e.especialidad}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary w-100">Agendar Cita</button>
        </form>
      </div>
    </div>
  );
}

export default AgendarCita;