import { useState, useEffect } from 'react';

const API = 'http://localhost:3001/api/citas';
const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function HorarioManager() {
  const [horarios, setHorarios] = useState([]);
  const [form, setForm] = useState({
    dia_semana: '1', hora_inicio: '09:00', hora_fin: '18:00', tipo: 'laboral', descripcion: ''
  });

  useEffect(() => { cargarHorarios(); }, []);

  const cargarHorarios = async () => {
    const res = await fetch(`${API}/horarios`);
    const data = await res.json();
    if (data.success) setHorarios(data.horarios);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/horarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (data.success) {
      alert('Horario agregado');
      cargarHorarios();
    }
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/horarios/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    cargarHorarios();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">📅 Horarios de Trabajo</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} className="mb-3 p-3 bg-light rounded">
          <div className="row">
            <div className="col-md-3 mb-2">
              <select className="form-control" value={form.dia_semana}
                onChange={(e) => setForm({...form, dia_semana: e.target.value})}>
                {DIAS.map((d, i) => i > 0 && <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="col-md-2 mb-2">
              <input type="time" className="form-control" value={form.hora_inicio}
                onChange={(e) => setForm({...form, hora_inicio: e.target.value})} />
            </div>
            <div className="col-md-2 mb-2">
              <input type="time" className="form-control" value={form.hora_fin}
                onChange={(e) => setForm({...form, hora_fin: e.target.value})} />
            </div>
            <div className="col-md-2 mb-2">
              <select className="form-control" value={form.tipo}
                onChange={(e) => setForm({...form, tipo: e.target.value})}>
                <option value="laboral">Laboral</option>
                <option value="feriado">Feriado</option>
                <option value="bloqueo">Bloqueo</option>
              </select>
            </div>
            <div className="col-md-3 mb-2">
              <button className="btn btn-primary w-100">Agregar</button>
            </div>
          </div>
        </form>

        <table className="table">
          <thead>
            <tr><th>Día</th><th>Inicio</th><th>Fin</th><th>Tipo</th><th></th></tr>
          </thead>
          <tbody>
            {horarios.map(h => (
              <tr key={h.cod_horario}>
                <td>{DIAS[h.dia_semana]}</td>
                <td>{h.hora_inicio}</td>
                <td>{h.hora_fin}</td>
                <td><span className={`badge ${h.tipo === 'laboral' ? 'bg-success' : 'bg-danger'}`}>{h.tipo}</span></td>
                <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(h.cod_horario)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HorarioManager;