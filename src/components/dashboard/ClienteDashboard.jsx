import MascotaList from '../citas/MascotaList';
import AgendarCita from '../citas/AgendarCita';
import CitaList from '../citas/CitaList';

function ClienteDashboard({ user }) {
  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="row">
          <div className="col-md-6 mb-3">
            <MascotaList />
          </div>
          <div className="col-md-6 mb-3">
            <AgendarCita />
          </div>
        </div>
      </div>
      <div className="col-12">
        <CitaList />
      </div>
    </div>
  );
}

export default ClienteDashboard;