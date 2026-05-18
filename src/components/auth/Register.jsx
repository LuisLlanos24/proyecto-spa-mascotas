import { useState } from 'react';
import { validateCI, validateNombre, validateEmail, validatePassword, getPasswordStrength, validateTelefono, validateEdad, validateSexo } from '../../utils/validations';
import PasswordInput from '../common/PasswordInput';
import Captcha from '../common/Captcha';


const API = 'http://localhost:3001/api';

function Register({ onSuccess }) {
  const [form, setForm] = useState({
    ci: '', nombre: '', email: '', contrasena: '',
    telefono: '', direccion: '', sexo: '', edad: ''
  });
  const [errors, setErrors] = useState({});

  const [passwordStrength, setPasswordStrength] = useState(null);

  const [captchaValido, setCaptchaValido] = useState(false);

const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
  
  // Medidor de fuerza para contraseña
  if (e.target.name === 'contrasena') {
    if (e.target.value) {
      setPasswordStrength(getPasswordStrength(e.target.value));
    } else {
      setPasswordStrength(null);
    }
  }
  
  if (errors[e.target.name]) {
    setErrors({ ...errors, [e.target.name]: '' });
  }
};

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.ci = validateCI(form.ci);
    newErrors.nombre = validateNombre(form.nombre);
    newErrors.email = validateEmail(form.email);
    newErrors.contrasena = validatePassword(form.contrasena);
    newErrors.telefono = validateTelefono(form.telefono);
    newErrors.edad = validateEdad(form.edad);
    newErrors.sexo = validateSexo(form.sexo);
    
    // Eliminar errores vacíos
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    
    if (data.success) {
      alert('Registrado exitosamente');
      onSuccess();
    } else {
      alert(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="mb-3">Registro de Cliente</h3>
      
      <div className="mb-3">
        <label className="form-label">CI *</label>
        <input name="ci" className={`form-control ${errors.ci ? 'is-invalid' : ''}`} 
          value={form.ci} onChange={handleChange} required />
        {errors.ci && <div className="invalid-feedback">{errors.ci}</div>}
      </div>
      
      <div className="mb-3">
        <label className="form-label">Nombre completo *</label>
        <input name="nombre" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} 
          value={form.nombre} onChange={handleChange} required />
        {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
      </div>
      
      <div className="mb-3">
        <label className="form-label">Email *</label>
        <input name="email" type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
          value={form.email} onChange={handleChange} required />
        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
      </div>
      
      <div className="mb-3">
        <label className="form-label">Contraseña *</label>
        <PasswordInput 
          name="contrasena"
          value={form.contrasena}
          onChange={handleChange}
          error={errors.contrasena}
          required
        />
        {errors.contrasena && <div className="invalid-feedback">{errors.contrasena}</div>}
        
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
        <label className="form-label">Teléfono</label>
        <input name="telefono" className={`form-control ${errors.telefono ? 'is-invalid' : ''}`} 
          value={form.telefono} onChange={handleChange} />
        {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
      </div>
      
      <div className="mb-3">
        <label className="form-label">Dirección</label>
        <input name="direccion" className="form-control" value={form.direccion} onChange={handleChange} />
      </div>
      
      <div className="row mb-3">
        <div className="col-6">
          <label className="form-label">Sexo</label>
          <select name="sexo" className={`form-control ${errors.sexo ? 'is-invalid' : ''}`} 
            value={form.sexo} onChange={handleChange}>
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
          {errors.sexo && <div className="invalid-feedback">{errors.sexo}</div>}
        </div>
        <div className="col-6">
          <label className="form-label">Edad</label>
          <input name="edad" type="number" className={`form-control ${errors.edad ? 'is-invalid' : ''}`} 
            value={form.edad} onChange={handleChange} />
          {errors.edad && <div className="invalid-feedback">{errors.edad}</div>}
        </div>
      </div>
      <Captcha onValidate={setCaptchaValido} />
      <button className="btn btn-primary w-100" disabled={!captchaValido}>
        Registrarse
      </button>
    </form>
  );
}

export default Register;