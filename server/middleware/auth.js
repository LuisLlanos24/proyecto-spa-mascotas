import jwt from 'jsonwebtoken';

const SECRET_KEY = 'veterinaria_secret_key_2026';

export const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
  }
};

export { SECRET_KEY };