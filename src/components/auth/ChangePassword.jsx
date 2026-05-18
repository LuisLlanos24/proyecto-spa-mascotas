import { useState } from 'react';
import { validatePassword, getPasswordStrength } from '../../utils/validations';
import PasswordInput from '../common/PasswordInput';

const API = 'http://localhost:3001/api';

function ChangePassword({ onPasswordChanged }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    
    if (e.target.value) {
      setPasswordStrength(getPasswordStrength(e.target.value));
    } else {
      setPasswordStrength(null);
    }
    
    if (errors.newPassword) {
      setErrors({ ...errors, newPassword: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validar nueva contraseña
    const passwordError = validatePassword(newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    
    // Validar coincidencia
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const res = await fetch(`${API}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ newPassword })
    });
    
    const data = await res.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      alert('Contraseña actualizada exitosamente');
      onPasswordChanged();
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-5">
        <div className="card">
          <div className="card-header bg-warning">
            <h5 className="mb-0">🔒 Cambiar Contraseña</h5>
          </div>
          <div className="card-body">
            <p className="text-muted">Es tu primer inicio de sesión, debes cambiar tu contraseña temporal.</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nueva Contraseña</label>
                <PasswordInput 
                  name="newPassword"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  error={errors.newPassword}
                  required
                />
                {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                
                {/* Medidor de fuerza */}
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className={`progress-bar bg-${passwordStrength.color}`} 
                        style={{ width: passwordStrength.width }}
                      ></div>
                    </div>
                    <small className={`text-${passwordStrength.color} mt-1 d-block`}>
                      Fortaleza: {passwordStrength.level}
                    </small>
                    <small className="text-muted">
                      💡 Sugerencia: Usa frases de 3-4 palabras (ej: "PerroFeliz*2026")
                    </small>
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <label className="form-label">Confirmar Contraseña</label>
                <PasswordInput 
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                  }}
                  required 
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>
              
              <button className="btn btn-warning w-100">Actualizar Contraseña</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;