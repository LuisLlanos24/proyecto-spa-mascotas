function EmpleadoDashboard({ user }) {
  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-body">
            <h4>👨‍⚕️ Bienvenido, {user.nombre}</h4>
            <p className="text-muted">
              Especialidad: {user.especialidad || 'especialidad'} | 
              Horario: {user.horario || 'No asignado'}
            </p>
          </div>
        </div>
      </div>

      <div className="col-md-6 mb-3">
        <div className="card h-100">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">📅 Citas de Hoy</h5>
          </div>
          <div className="card-body">
            <p className="text-center text-muted">No hay citas pendientes</p>
          </div>
        </div>
      </div>

      <div className="col-md-6 mb-3">
        <div className="card h-100">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">✅ Últimas Atenciones</h5>
          </div>
          <div className="card-body">
            <p className="text-center text-muted">Sin atenciones recientes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmpleadoDashboard;