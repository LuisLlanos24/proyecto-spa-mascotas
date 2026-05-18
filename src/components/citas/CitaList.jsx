import { useState, useEffect } from 'react';

const API = 'http://localhost:3001/api/citas';

function CitaList() {
  const [citas, setCitas] = useState([]);

  const cargarCitas = async () => {
    const res = await fetch(`${API}/citas`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    if (data.success) setCitas(data.citas);
  };

  useEffect(() => { cargarCitas(); }, []);

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-warning',
      confirmada: 'bg-info',
      completada: 'bg-success',
      cancelada: 'bg-danger'
    };
    return badges[estado] || 'bg-secondary';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">📋 Mis Citas</h5>
      </div>
      <div className="card-body">
        {citas.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Mascota</th>
                  <th>Servicio</th>
                  <th>Empleado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {citas.map(c => (
                  <tr key={c.cod_cita}>
                    <td>{new Date(c.fecha).toLocaleDateString()}</td>
                    <td>{c.hora?.substring(0,5)}</td>
                    <td>{c.mascota}</td>
                    <td>{c.servicio}</td>
                    <td>{c.empleado || 'Sin asignar'}</td>
                    <td><span className={`badge ${getEstadoBadge(c.estado)}`}>{c.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-muted">No tienes citas agendadas</p>
        )}
      </div>
    </div>
  );
}

export default CitaList;