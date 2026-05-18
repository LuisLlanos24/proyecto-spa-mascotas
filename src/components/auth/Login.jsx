import { useState } from 'react';
import Captcha from '../common/Captcha';

const API = 'http://localhost:3001/api';

function Login({ onLogin }) {
  const [captchaValido, setCaptchaValido] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!captchaValido) {
      alert('Resuelve el captcha');
      return;
    }
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const contrasena = formData.get('contrasena');
    
    const res = await fetch(`${API}/2fa/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contrasena })
    });
    const data = await res.json();
    
    if (data.success) {
      if (data.necesita2FA) {
        onLogin({ email, necesita2FA: true });
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.mustChangePassword) data.user.mustChangePassword = true;
        onLogin(data.user);
      }
    } else {
      alert(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="mb-3">Iniciar Sesión</h3>
      
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input name="email" type="email" className="form-control" required />
      </div>
      
      <div className="mb-3">
        <label className="form-label">Contraseña</label>
        <div className="input-group">
          <input name="contrasena" type="password" className="form-control" required id="loginPassword" />
          <button type="button" className="btn btn-outline-secondary"
            onClick={() => {
              const input = document.getElementById('loginPassword');
              input.type = input.type === 'password' ? 'text' : 'password';
            }}>👁️</button>
        </div>
      </div>
      
      <Captcha onValidate={setCaptchaValido} />
      
      <button className="btn btn-success w-100" disabled={!captchaValido}>
        Ingresar
      </button>
    </form>
  );
}

export default Login;