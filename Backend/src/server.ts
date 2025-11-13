// Ruta:Joyeria-Diana-Laura/Backend/src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';  // ✅ Agregar esta importación

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Usar las rutas de autenticación
app.use('/api/auth', authRoutes);

// ✅ AGREGAR: Usar las rutas de usuarios
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🚀 Backend Diana Laura - Login & Users API',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/db-test', async (req, res) => {
  const dbOk = await testConnection();
  res.json({
    success: dbOk,
    message: dbOk ? '✅ BD Conectada' : '❌ Error BD'
  });
});

app.listen(PORT, async () => {
  console.log(`🎯 Servidor en puerto ${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/api/health`);
  console.log(`   🗄️  DB Test: http://localhost:${PORT}/api/db-test`);
  
  await testConnection();
});