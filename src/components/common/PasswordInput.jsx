import { useState } from 'react';

function PasswordInput({ name, value, onChange, error, placeholder, required }) {
  const [show, setShow] = useState(false);

  return (
    <div className="input-group">
      <input 
        type={show ? 'text' : 'password'}
        name={name}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
      <button 
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setShow(!show)}
      >
        {show ? '🙈' : '👁️'}
      </button>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

export default PasswordInput;