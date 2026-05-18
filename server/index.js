import express from 'express';
import cors from 'cors';
import { logsMiddleware } from './middleware/logs.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import dosfaRoutes from './routes/2fa.js';
import citasRoutes from './routes/citas.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(logsMiddleware);

// Rutas
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/2fa', dosfaRoutes);
app.use('/api/citas', citasRoutes);

app.listen(3001, () => console.log('🔥 Servidor Express en puerto 3001'));