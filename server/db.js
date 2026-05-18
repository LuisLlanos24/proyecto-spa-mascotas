import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bd_pet'
});

db.connect(err => {
  if (err) console.error('Error DB:', err);
  else console.log('MySQL conectado');
});

export default db;