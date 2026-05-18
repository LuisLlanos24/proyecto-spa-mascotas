import { useState } from 'react';

const API = 'http://localhost:3001/api';

function TwoFactorAuth({ email, onSuccess, onCancel }) {
  const [codigo, setCodigo] = useState('');
  const [message, setMessage] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    
    const res = await fetch(`${API}/2fa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, codigo })
    });
    const data = await res.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.mustChangePassword) data.user.mustChangePassword = true;
      onSuccess(data.user);
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-4">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">🔐 Verificación 2 pasos</h5>
          </div>
          <div className="card-body">
            <p>Revisa tu correo <strong>{email}</strong></p>
            
            <form onSubmit={handleVerify}>
              <div className="mb-3">
                <label className="form-label">Código de 6 dígitos</label>
                <input 
                  type="text" 
                  className="form-control" 
                  maxLength="6"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="000000"
                  required 
                />
              </div>
              
              {message && <div className="alert alert-danger">{message}</div>}
              
              <button className="btn btn-primary w-100 mb-2">Verificar</button>
              <button type="button" className="btn btn-secondary w-100" onClick={onCancel}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFactorAuth;