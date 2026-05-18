import { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ChangePassword from './components/auth/ChangePassword';
import AdminDashboard from './components/dashboard/AdminDashboard';
import EmpleadoDashboard from './components/dashboard/EmpleadoDashboard';
import ClienteDashboard from './components/dashboard/ClienteDashboard';
import TwoFactorAuth from './components/auth/TwoFactorAuth';

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [twoFactorEmail, setTwoFactorEmail] = useState(null);

useEffect(() => {
  const savedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  if (savedUser && token) {
    const userData = JSON.parse(savedUser);
    // Si el usuario fue desactivado, no permitir acceso
    if (userData.estado === 'inactivo') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      alert('Tu cuenta ha sido desactivada. Contacta al administrador.');
    } else {
      setUser(userData);
    }
  }
}, []);

  useEffect(() => {
    if (!user) return;
    
    let timeout;
    
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        alert('Sesión cerrada por inactividad (30 minutos)');
        handleLogout();
      }, 30 * 60 * 1000); // 30 minutos
    };
    
    // Eventos que reinician el timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    resetTimer(); // Iniciar timer
    
    return () => {
      clearTimeout(timeout);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  const handleLogin = (userData) => {
    if (userData.necesita2FA) {
      setTwoFactorEmail(userData.email);
      return;
    }
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handlePasswordChanged = () => {
    const updatedUser = JSON.parse(localStorage.getItem('user'));
    updatedUser.mustChangePassword = false;
    updatedUser.primer_login = false;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  if (twoFactorEmail) {
    return (
      <TwoFactorAuth 
        email={twoFactorEmail}
        onSuccess={(user) => {
          setTwoFactorEmail(null);
          setUser(user);
        }}
        onCancel={() => setTwoFactorEmail(null)}
      />
    );
  }

  // Si el usuario está logueado pero debe cambiar contraseña
  if (user && user.mustChangePassword) {
    return <ChangePassword onPasswordChanged={handlePasswordChanged} />;
  }

  // Dashboards normales
  if (user && !user.mustChangePassword) {
    return (
      <div className="container-fluid p-0">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
          <div className="container-fluid">
            <span className="navbar-brand">🐾 SpaSystem</span>
            <div className="d-flex align-items-center gap-3">
              <span className="text-light">
                {user.nombre} | <span className="badge bg-info">{user.rol}</span>
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </nav>
        <div className="container mt-4">
          {user.rol === 'ADMINISTRADOR' && <AdminDashboard user={user} />}
          {user.rol === 'EMPLEADO' && <EmpleadoDashboard user={user} />}
          {user.rol === 'CLIENTE' && <ClienteDashboard user={user} />}
        </div>
      </div>
    );
  }

  // Login/Register
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <h2 className="text-center mb-4">🐾 SPA SYSTEM</h2>
          <div className="btn-group w-100 mb-4">
            <button 
              className={`btn ${view === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setView('login')}
            >
              Iniciar Sesión
            </button>
            <button 
              className={`btn ${view === 'register' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setView('register')}
            >
              Registrarse
            </button>
          </div>

          {view === 'login' ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Register onSuccess={handleRegisterSuccess} />
          )}
        </div>
      </div>
    </div>
  );
}

function handleRegisterSuccess() {
  window.location.reload();
}

export default App;