import { useState, useEffect } from 'react';
import { validateCI, validateNombre, validateEmail, validateTelefono, validateEdad, validateSexo } from '../../utils/validations';
import ServicioManager from '../servicios/ServicioManager';

const API = 'http://localhost:3001/api';

function AdminDashboard({ user }) {
  const [activeMenu, setActiveMenu] = useState('inicio');
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    ci: '', nombre: '', email: '',
    telefono: '', direccion: '', sexo: '', edad: '',
    rol: 'EMPLEADO', especialidad: '', horario: ''
  });
  const [logs, setLogs] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
  if (activeMenu === 'logs') {
    fetch(`${API}/admin/logs`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setLogs(data.logs);
      });
  }
}, [activeMenu]);

  // Cargar usuarios
  useEffect(() => {
    if (activeMenu === 'usuarios') {
      fetch(`${API}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setUsers(data.users);
        });
    }
  }, [activeMenu]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };


  const handleDelete = async (ci) => {
  if (!confirm('¿Eliminar este usuario?')) return;
  
  const res = await fetch(`${API}/admin/users/${ci}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  const data = await res.json();
  
  if (data.success) {
    alert('Usuario eliminado');
    setUsers(users.filter(u => u.ci !== ci));
  } else {
    alert(data.message);
  }
};

const handleEdit = (user) => {
  setEditingUser(user);
  setForm({
    ci: user.ci,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono || '',
    direccion: user.direccion || '',
    sexo: user.sexo || '',
    edad: user.edad || '',
    rol: user.rol,
    especialidad: '',
    horario: ''
  });
  setShowForm(true);
};

const handleUpdate = async (e) => {
  e.preventDefault();
  
const res = await fetch(`${API}/admin/users/${editingUser.ci}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(form)
  });
  const data = await res.json();
  
  if (data.success) {
    alert('Usuario actualizado');
    setEditingUser(null);
    setShowForm(false);
    // Recargar lista
    const usersRes = await fetch(`${API}/admin/users`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const usersData = await usersRes.json();
    if (usersData.success) setUsers(usersData.users);
  } else {
    alert(data.message);
  }
};


  const validateForm = () => {
    const newErrors = {};

    newErrors.ci = validateCI(form.ci);
    newErrors.nombre = validateNombre(form.nombre);
    newErrors.email = validateEmail(form.email);
    newErrors.telefono = validateTelefono(form.telefono);
    newErrors.edad = validateEdad(form.edad);
    newErrors.sexo = validateSexo(form.sexo);

    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const res = await fetch(`${API}/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form)
    });
    const data = await res.json();

    if (data.success) {
      alert(`${data.message}\n\n📱 Contraseña temporal: ${data.tempPassword}\n\nEnvíala por WhatsApp al usuario.`);
      setShowForm(false);
      setForm({
        ci: '', nombre: '', email: '',
        telefono: '', direccion: '', sexo: '', edad: '',
        rol: 'EMPLEADO', especialidad: '', horario: ''
      });
      // Recargar lista
      const usersRes = await fetch(`${API}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users);
    } else {
      alert(data.message);
    }
  };

  const handleToggleStatus = async (ci, estadoActual) => {
  const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
  const accion = nuevoEstado === 'activo' ? 'activar' : 'desactivar';
  
  if (!confirm(`¿${accion} este usuario?`)) return;
  
  const res = await fetch(`${API}/admin/users/${ci}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ estado: nuevoEstado })
  });
  const data = await res.json();
  
  if (data.success) {
    alert(data.message);
    // Actualizar lista
    const usersRes = await fetch(`${API}/admin/users`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const usersData = await usersRes.json();
    if (usersData.success) setUsers(usersData.users);
  }
};

const handleToggle2FA = async (ci, estadoActual) => {
  const res = await fetch(`${API}/admin/users/${ci}/2fa`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ activar: !estadoActual })
  });
  const data = await res.json();
  
  if (data.success) {
    alert(data.message);
    // Recargar lista de usuarios
    const usersRes = await fetch(`${API}/admin/users`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const usersData = await usersRes.json();
    if (usersData.success) setUsers(usersData.users);
  }
};

  const menuItems = [
    { id: 'inicio', label: '📊 Inicio' },
    { id: 'usuarios', label: '👥 Usuarios' },
    { id: 'servicios', label: '💉 Servicios' },
    { id: 'inventario', label: '📦 Inventario' },
    { id: 'reportes', label: '📈 Reportes' },
    { id: 'logs', label: '📋 Auditoría' },
  ];

  return (
    <div className="row">
      {/* Sidebar */}
      <div className="col-md-3">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Panel Admin</h5>
          </div>
          <div className="list-group list-group-flush">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`list-group-item list-group-item-action ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="col-md-9">
        {activeMenu === 'inicio' && (
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5>Total Usuarios</h5>
                  <h2>{users.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h5>Citas Hoy</h5>
                  <h2>0</h2>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'usuarios' && (
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Gestión de Usuarios</h5>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingUser(null); // Limpiar edición
                  setErrors({}); // Limpiar errores
                  setForm({
                    ci: '', nombre: '', email: '',
                    telefono: '', direccion: '', sexo: '', edad: '',
                    rol: 'EMPLEADO', especialidad: '', horario: ''
                  }); // Resetear formulario
                }}
              >
                {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
              </button>

            </div>
            <div className="card-body">
              {/* Formulario de registro */}
              {showForm && (
                <form onSubmit={editingUser ? handleUpdate : handleSubmit} className="mb-4 p-3 border rounded bg-light">
                  <h6 className="mb-3">Registrar Nuevo Usuario</h6>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">CI *</label>
                      <input name="ci" className={`form-control ${errors.ci ? 'is-invalid' : ''}`}
                        value={form.ci} onChange={handleChange} required />
                      {errors.ci && <div className="invalid-feedback">{errors.ci}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre *</label>
                      <input name="nombre" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                        value={form.nombre} onChange={handleChange} required />
                      {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input name="email" type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={form.email} onChange={handleChange} required />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contraseña (automática)</label>
                      <input className="form-control" value="Se generará automáticamente" disabled />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Teléfono</label>
                      <input name="telefono" className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                        value={form.telefono} onChange={handleChange} />
                      {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Dirección</label>
                      <input name="direccion" className="form-control"
                        value={form.direccion} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Sexo</label>
                      <select name="sexo" className={`form-control ${errors.sexo ? 'is-invalid' : ''}`}
                        value={form.sexo} onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                      {errors.sexo && <div className="invalid-feedback">{errors.sexo}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Edad</label>
                      <input name="edad" type="number" className={`form-control ${errors.edad ? 'is-invalid' : ''}`}
                        value={form.edad} onChange={handleChange} />
                      {errors.edad && <div className="invalid-feedback">{errors.edad}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Rol *</label>
                      <select name="rol" className="form-control"
                        value={form.rol} onChange={handleChange}>
                        <option value="EMPLEADO">Empleado</option>
                        <option value="ADMINISTRADOR">Administrador</option>
                      </select>
                    </div>
                  </div>

                  {form.rol === 'EMPLEADO' && (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Especialidad</label>
                        <select 
                          name="especialidad" 
                          className="form-control"
                          value={form.especialidad} 
                          onChange={handleChange}
                        >
                          <option value="">Seleccionar</option>
                          <option value="Veterinario General">Veterinario General</option>
                          
                          <option value="Dermatología">Dermatología</option>
                          <option value="Odontología">Odontología</option>
                          <option value="Cardiología">Groomer</option>
                          <option value="Peluquería">Peluquería</option>
                          <option value="Recepción">Recepción</option>
                          <option value="Limpieza">Limpieza</option>
                          <option value="Masajista">Masajista</option>
                          <option value="Asistente">Asistente</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Horario</label>
                        <select 
                          name="horario" 
                          className="form-control"
                          value={form.horario} 
                          onChange={handleChange}
                        >
                          <option value="">Seleccionar</option>
                          <option value="08:00-16:00">Tiempo Completo (08:00-16:00)</option>
                          <option value="08:00-12:00">Medio Tiempo AM (08:00-12:00)</option>
                          <option value="12:00-16:00">Medio Tiempo PM (12:00-16:00)</option>
                          <option value="16:00-20:00">Tarde (16:00-20:00)</option>
                          <option value="08:00-20:00">Turno Extendido (08:00-20:00)</option>
                          <option value="Fin de Semana">Fin de Semana</option>
                        </select>
                      </div>
                    </div>
                  )}

                    <button className="btn btn-success">
                      {editingUser ? 'Actualizar' : 'Registrar Usuario'}
                    </button>
                </form>
              )}

              {/* Tabla de usuarios */}
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>CI</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map(u => (
                        
                        <tr key={u.ci}>
                          <td>{u.ci}</td>
                          <td>{u.nombre}</td>
                          <td>{u.email}</td>
                          <td><span className={`badge ${u.rol === 'ADMINISTRADOR' ? 'bg-danger' : u.rol === 'EMPLEADO' ? 'bg-warning' : 'bg-info'}`}>
                            {u.rol}
                          </span></td>
                          <td>{new Date(u.fecha_registro).toLocaleDateString()}</td>

                          <td>
                            <button className="btn btn-warning btn-sm me-1" onClick={() => handleEdit(u)}>✏️</button>
                            <button 
                              className={`btn btn-sm ${u.estado === 'activo' ? 'btn-danger' : 'btn-success'}`}
                              onClick={() => handleToggleStatus(u.ci, u.estado)}
                            >
                              {u.estado === 'activo' ? '🔒' : '🔓'}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">No hay usuarios registrados</td>
                      </tr>
                      
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeMenu === 'servicios' && <ServicioManager />}

        {activeMenu === 'logs' && (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">📋 Registro de Auditoría</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Acción</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? (
                      logs.map(log => (
                        <tr key={log.id}>
                          <td>{new Date(log.fecha).toLocaleString()}</td>
                          <td>{log.usuario_ci}</td>
                          <td><span className="badge bg-secondary">{log.rol}</span></td>
                          <td>{log.accion}</td>
                          <td>{log.ip}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" className="text-center">No hay registros</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;