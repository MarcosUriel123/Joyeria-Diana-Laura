// Ruta:Joyeria-Diana-Laura/Backend/src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

// Cargar variables de entorno
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// 🚨 CONFIGURACIÓN CORS MÁS PERMISIVA TEMPORALMENTE
app.use(cors({
  origin: true, // Permite todos los orígenes temporalmente
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Manejar preflight requests explícitamente
app.options('*', cors());

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🚀 Backend Diana Laura - Login & Users API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    cors: 'Configurado para todos los orígenes'
  });
});

// Resto del código igual...
app.get('/api/db-test', async (req, res) => {
  const dbOk = await testConnection();
  res.json({
    success: dbOk,
    message: dbOk ? '✅ BD Conectada' : '❌ Error BD'
  });
});

app.get('/api/config-check', async (req, res) => {
  const dbOk = await testConnection();
  res.json({
    success: true,
    services: {
      database: dbOk ? '✅ Conectado' : '❌ Error',
      cors: '✅ Configurado para todos los orígenes'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Error global:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🎯 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 CORS configurado para: TODOS LOS ORÍGENES`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`);
  
  await testConnection();
});