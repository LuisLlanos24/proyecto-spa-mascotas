import { useState, useEffect } from 'react';

const API = 'http://localhost:3001/api/citas';

function ServicioManager() {
  const [servicios, setServicios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio_base: '', duracion: ''
  });

  useEffect(() => { cargarServicios(); }, []);

  const cargarServicios = async () => {
    const res = await fetch(`${API}/servicios`);
    const data = await res.json();
    if (data.success) setServicios(data.servicios);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `${API}/servicios/${editingId}` : `${API}/servicios`;
    const method = editingId ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    
    if (data.success) {
      alert(data.message);
      setShowForm(false);
      setEditingId(null);
      setForm({ nombre: '', descripcion: '', precio_base: '', duracion: '' });
      cargarServicios();
    } else {
      alert(data.message);
    }
  };

  const handleEdit = (s) => {
    setForm(s);
    setEditingId(s.cod_servicio);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar servicio?')) return;
    await fetch(`${API}/servicios/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    cargarServicios();
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">💉 Gestión de Servicios</h5>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Servicio'}
        </button>
      </div>
      <div className="card-body">
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-3 p-3 bg-light rounded">
            <h6>{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h6>
            <div className="row">
              <div className="col-md-6 mb-2">
                <input name="nombre" className="form-control" placeholder="Nombre" value={form.nombre}
                  onChange={(e) => setForm({...form, nombre: e.target.value})} required />
              </div>
              <div className="col-md-6 mb-2">
                <input name="descripcion" className="form-control" placeholder="Descripción" value={form.descripcion}
                  onChange={(e) => setForm({...form, descripcion: e.target.value})} />
              </div>
              <div className="col-md-6 mb-2">
                <input name="precio_base" type="number" step="0.01" className="form-control" placeholder="Precio" value={form.precio_base}
                  onChange={(e) => setForm({...form, precio_base: e.target.value})} required />
              </div>
              <div className="col-md-6 mb-2">
                <input name="duracion" type="number" className="form-control" placeholder="Duración (minutos)" value={form.duracion}
                  onChange={(e) => setForm({...form, duracion: e.target.value})} required />
              </div>
            </div>
            <button className="btn btn-success">{editingId ? 'Actualizar' : 'Guardar'}</button>
          </form>
        )}

        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map(s => (
                <tr key={s.cod_servicio}>
                  <td>{s.nombre}</td>
                  <td>{s.descripcion}</td>
                  <td>${s.precio_base}</td>
                  <td>{s.duracion} min</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-1" onClick={() => handleEdit(s)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.cod_servicio)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ServicioManager;