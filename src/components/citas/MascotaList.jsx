import { useState, useEffect } from 'react';

const API = 'http://localhost:3001/api/citas';

function MascotaList() {
  const [mascotas, setMascotas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombre: '', especie: '', raza: '', fecha_nac: '', peso: '', restricciones: ''
  });

  const cargarMascotas = async () => {
    const res = await fetch(`${API}/mascotas`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    if (data.success) setMascotas(data.mascotas);
  };

  useEffect(() => { cargarMascotas(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/mascotas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (data.success) {
      alert('Mascota registrada');
      setShowForm(false);
      cargarMascotas();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar mascota?')) return;
    await fetch(`${API}/mascotas/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    cargarMascotas();
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between">
        <h5 className="mb-0">🐾 Mis Mascotas</h5>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          + Nueva Mascota
        </button>
      </div>
      <div className="card-body">
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-3 p-3 bg-light rounded">
            <div className="row">
              <div className="col-md-6 mb-2">
                <input name="nombre" className="form-control" placeholder="Nombre" onChange={(e) => setForm({...form, nombre: e.target.value})} required />
              </div>
              <div className="col-md-6 mb-2">
                <input name="especie" className="form-control" placeholder="Especie" onChange={(e) => setForm({...form, especie: e.target.value})} required />
              </div>
              <div className="col-md-4 mb-2">
                <input name="raza" className="form-control" placeholder="Raza" onChange={(e) => setForm({...form, raza: e.target.value})} />
              </div>
              <div className="col-md-4 mb-2">
                <input name="fecha_nac" type="date" className="form-control" onChange={(e) => setForm({...form, fecha_nac: e.target.value})} />
              </div>
              <div className="col-md-4 mb-2">
                <input name="peso" type="number" step="0.1" className="form-control" placeholder="Peso (kg)" onChange={(e) => setForm({...form, peso: e.target.value})} />
              </div>
            </div>
            <button className="btn btn-success">Guardar</button>
          </form>
        )}

        <div className="row">
          {mascotas.map(m => (
            <div key={m.cod_mascota} className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h6>{m.nombre}</h6>
                  <small className="text-muted">
                    {m.especie} | {m.raza}<br/>
                    Peso: {m.peso} kg
                  </small>
                  <br/>
                  <button className="btn btn-danger btn-sm mt-2" onClick={() => handleDelete(m.cod_mascota)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MascotaList;