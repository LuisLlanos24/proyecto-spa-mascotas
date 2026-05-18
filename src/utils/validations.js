export const validateCI = (ci) => {
  if (!ci) return 'CI es obligatorio';
  if (!/^\d+$/.test(ci)) return 'CI debe contener solo números';
  if (ci.length < 7 || ci.length > 10) return 'CI debe tener entre 7 y 10 dígitos';
  return '';
};

export const validateNombre = (nombre) => {
  if (!nombre) return 'Nombre es obligatorio';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) return 'Nombre solo debe contener letras';
  if (nombre.length < 3) return 'Nombre debe tener al menos 3 caracteres';
  if (nombre.length > 100) return 'Nombre máximo 100 caracteres';
  return '';
};

export const validateEmail = (email) => {
  if (!email) return 'Email es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email no es válido';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Contraseña es obligatoria';
  if (password.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Debe contener al menos 1 mayúscula';
  if (!/[a-z]/.test(password)) return 'Debe contener al menos 1 minúscula';
  if (!/[0-9]/.test(password)) return 'Debe contener al menos 1 número';
  if (!/[*#!@$%&]/.test(password)) return 'Debe contener al menos 1 símbolo (*, #, !, @, $, %, &)';
  return '';
};

// Medidor de fuerza
export const getPasswordStrength = (password) => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[*#!@$%&]/.test(password)) score++;
  if (password.length >= 16) score++;
  
  if (score <= 2) return { level: 'Débil', color: 'danger', width: '25%' };
  if (score <= 4) return { level: 'Media', color: 'warning', width: '50%' };
  if (score <= 6) return { level: 'Fuerte', color: 'info', width: '75%' };
  return { level: 'Muy Fuerte', color: 'success', width: '100%' };
};

export const validateTelefono = (telefono) => {
  if (!telefono) return ''; // Opcional
  if (!/^\d+$/.test(telefono)) return 'Teléfono solo números';
  if (telefono.length < 7 || telefono.length > 15) return 'Teléfono entre 7 y 15 dígitos';
  return '';
};

export const validateEdad = (edad) => {
  if (!edad) return ''; // Opcional
  const num = parseInt(edad);
  if (isNaN(num)) return 'Edad debe ser número';
  if (num < 18 || num > 120) return 'Edad entre 18 y 120';
  return '';
};

export const validateSexo = (sexo) => {
  if (!sexo) return ''; // Opcional
  if (!['M', 'F'].includes(sexo)) return 'Sexo inválido';
  return '';
};