// Ruta:Joyeria-Diana-Laura/Backend/src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

// Cargar variables de entorno según el entorno
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// 🔧 CONFIGURACIÓN CORS MEJORADA
const allowedOrigins = [
  'http://localhost:3000',
  'https://joyeria-diana-laura.vercel.app',
  'https://joyeria-diana-laura-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Manejar preflight requests
app.options('*', cors());

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint para Render
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🚀 Backend Diana Laura - Login & Users API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    allowedOrigins: allowedOrigins
  });
});

app.get('/api/db-test', async (req, res) => {
  const dbOk = await testConnection();
  res.json({
    success: dbOk,
    message: dbOk ? '✅ BD Conectada' : '❌ Error BD',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta para verificar configuración de servicios
app.get('/api/config-check', async (req, res) => {
  const dbOk = await testConnection();
  const firebaseOk = process.env.FIREBASE_PROJECT_ID ? true : false;
  const zerobounceOk = process.env.ZEROBOUNCE_API_KEY ? true : false;
  
  res.json({
    success: true,
    services: {
      database: dbOk ? '✅ Conectado' : '❌ Error',
      firebase: firebaseOk ? '✅ Configurado' : '⚠️ No configurado',
      zerobounce: zerobounceOk ? '✅ Configurado' : '⚠️ No configurado'
    },
    cors: {
      allowedOrigins: allowedOrigins
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
  console.log(`🔧 CORS configurado para:`, allowedOrigins);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/api/health`);
  console.log(`   🗄️  DB Test: http://localhost:${PORT}/api/db-test`);
  console.log(`   ⚙️  Config Check: http://localhost:${PORT}/api/config-check`);
  
  // Probar conexión a BD
  await testConnection();
});