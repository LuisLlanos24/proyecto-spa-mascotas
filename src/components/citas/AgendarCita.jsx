import { useState, useEffect } from 'react';

const API = 'http://localhost:3001/api/citas';

function AgendarCita() {
  const [mascotas, setMascotas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [slots, setSlots] = useState([]);
  const [duracionAjustada, setDuracionAjustada] = useState(null);
  const [capacidad, setCapacidad] = useState(null);
  const [form, setForm] = useState({
    cod_mascota: '', cod_servicio: '', fecha: '', hora: '', cod_empleado: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const [mascRes, servRes, empRes] = await Promise.all([
      fetch(`${API}/mascotas`, { headers }),
      fetch(`${API}/servicios`),
      fetch(`${API}/empleados`, { headers })
    ]);

    const mascData = await mascRes.json();
    const servData = await servRes.json();
    const empData = await empRes.json();

    if (mascData.success) setMascotas(mascData.mascotas);
    if (servData.success) setServicios(servData.servicios);
    if (empData.success) setEmpleados(empData.empleados);
  };

  // Calcular duración ajustada cuando cambia mascota o servicio
  useEffect(() => {
    if (form.cod_mascota && form.cod_servicio) {
      calcularDuracion();
    }
  }, [form.cod_mascota, form.cod_servicio]);

  // Cargar slots cuando cambia fecha o duración
  useEffect(() => {
    if (form.fecha && duracionAjustada) {
      cargarSlots();
      cargarCapacidad();
    }
  }, [form.fecha, duracionAjustada]);

  const calcularDuracion = async () => {
    const res = await fetch(`${API}/calcular-duracion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        cod_mascota: form.cod_mascota,
        cod_servicio: form.cod_servicio
      })
    });
    const data = await res.json();
    if (data.success) {
      setDuracionAjustada(data.duracion_ajustada);
    }
  };

  const cargarSlots = async () => {
    const res = await fetch(`${API}/disponibilidad/${form.fecha}/${duracionAjustada}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    if (data.success) {
      setSlots(data.slots);
      setForm(prev => ({ ...prev, hora: '' })); // Resetear hora
    }
  };

  const cargarCapacidad = async () => {
    const res = await fetch(`${API}/capacidad/${form.fecha}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    if (data.success) setCapacidad(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.hora) {
      return alert('Selecciona un horario disponible');
    }
    
    const res = await fetch(`${API}/citas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...form,
        duracion_real: duracionAjustada
      })
    });
    const data = await res.json();
    
    if (data.success) {
      alert('✅ Cita solicitada. Espera confirmación.');
      setForm({ cod_mascota: '', cod_servicio: '', fecha: '', hora: '', cod_empleado: '' });
      setSlots([]);
      setDuracionAjustada(null);
      setCapacidad(null);
    } else {
      alert(data.message);
    }
  };

  // Fecha mínima: mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">📅 Solicitar Cita</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Mascota</label>
            <select className="form-control" value={form.cod_mascota}
              onChange={(e) => setForm({...form, cod_mascota: e.target.value})} required>
              <option value="">Seleccionar mascota</option>
              {mascotas.map(m => (
                <option key={m.cod_mascota} value={m.cod_mascota}>
                  {m.nombre} ({m.especie} - {m.tamanio || 'pequeño'})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Servicio</label>
            <select className="form-control" value={form.cod_servicio}
              onChange={(e) => setForm({...form, cod_servicio: e.target.value})} required>
              <option value="">Seleccionar servicio</option>
              {servicios.map(s => (
                <option key={s.cod_servicio} value={s.cod_servicio}>
                  {s.nombre} - ${s.precio_base} ({s.duracion} min base)
                </option>
              ))}
            </select>
          </div>

          {duracionAjustada && (
            <div className="alert alert-info">
              ⏱️ Duración estimada: <strong>{duracionAjustada} minutos</strong>
              {duracionAjustada !== servicios.find(s => s.cod_servicio == form.cod_servicio)?.duracion && 
                ' (ajustada por tamaño/temperamento)'}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Fecha</label>
            <input type="date" className="form-control" min={minDate}
              value={form.fecha} onChange={(e) => setForm({...form, fecha: e.target.value})} required />
          </div>

          {capacidad && (
            <div className={`alert ${capacidad.disponibles > 0 ? 'alert-success' : 'alert-danger'}`}>
              Capacidad: {capacidad.ocupadas}/{capacidad.capacidad} citas ({capacidad.disponibles} disponibles)
            </div>
          )}

          {slots.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Horarios disponibles</label>
              <div className="row">
                {slots.map(slot => (
                  <div key={slot} className="col-4 mb-2">
                    <button
                      type="button"
                      className={`btn btn-sm w-100 ${form.hora === slot ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setForm({...form, hora: slot})}
                    >
                      {slot}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.fecha && slots.length === 0 && duracionAjustada && (
            <div className="alert alert-warning">No hay horarios disponibles para esta fecha</div>
          )}

          <div className="mb-3">
            <label className="form-label">Groomer (opcional)</label>
            <select className="form-control" value={form.cod_empleado}
              onChange={(e) => setForm({...form, cod_empleado: e.target.value})}>
              <option value="">Sin preferencia</option>
              {empleados.filter(e => e.especialidad?.includes('Peluquería') || e.especialidad?.includes('Groomer'))
                .map(e => (
                  <option key={e.ci} value={e.ci}>{e.nombre}</option>
                ))}
            </select>
          </div>

          <button className="btn btn-primary w-100" disabled={!form.hora}>
            Solicitar Cita
          </button>
        </form>
      </div>
    </div>
  );
}

export default AgendarCita;