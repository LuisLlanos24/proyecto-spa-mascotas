import { useState, useEffect } from 'react';

function Captcha({ onValidate }) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operador, setOperador] = useState('+');
  const [respuesta, setRespuesta] = useState('');
  const [error, setError] = useState('');
  const [valido, setValido] = useState(false);

  const generarCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    
    setNum1(n1);
    setNum2(n2);
    setOperador(op);
    setRespuesta('');
    setError('');
    setValido(false);
    onValidate(false);
  };

  useEffect(() => {
    generarCaptcha();
  }, []);

  const calcularResultado = () => {
    switch(operador) {
      case '+': return num1 + num2;
      case '-': return num1 - num2;
      case '×': return num1 * num2;
      default: return 0;
    }
  };

  const verificar = (e) => {
    const valor = e.target.value;
    setRespuesta(valor);
    
    if (valor === '') {
      setError('');
      setValido(false);
      onValidate(false);
      return;
    }

    if (parseInt(valor) === calcularResultado()) {
      setError('');
      setValido(true);
      onValidate(true);
    } else {
      setError('Respuesta incorrecta');
      setValido(false);
      onValidate(false);
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label">Verificación: ¿Cuánto es {num1} {operador} {num2}?</label>
      <div className="input-group">
        <input
          type="number"
          className={`form-control ${error ? 'is-invalid' : valido ? 'is-valid' : ''}`}
          value={respuesta}
          onChange={verificar}
          placeholder="Escribe el resultado"
          required
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={generarCaptcha}
          title="Nuevo captcha"
        >
          🔄
        </button>
      </div>
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {valido && <div className="valid-feedback d-block">✅ Correcto</div>}
    </div>
  );
}

export default Captcha;