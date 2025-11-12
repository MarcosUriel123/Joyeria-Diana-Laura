// Ruta: Joyeria-Diana-Laura/Backend/src/config/database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuración mejorada para Railway/Render
const getDatabaseConfig = () => {
  // Preferir DATABASE_URL si existe (Railway/Render la proporciona)
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    };
  }

  // Configuración manual
  return {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  };
};

export const pool = new Pool(getDatabaseConfig());

export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL en Railway/Render');
    
    // Verificar conexión básica
    const result = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Hora del servidor:', result.rows[0].current_time);
    
    // Verificar si la tabla existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      )
    `);
    
    console.log('📊 Tabla usuarios existe:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      const userCount = await client.query('SELECT COUNT(*) as count FROM usuarios');
      console.log('👥 Usuarios en la BD:', userCount.rows[0].count);
    } else {
      console.log('⚠️  La tabla usuarios NO existe');
    }
    
    client.release();
    return true;
  } catch (error: any) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    console.log('🔍 Detalles de conexión:');
    console.log('   Host:', process.env.DB_HOST);
    console.log('   Puerto:', process.env.DB_PORT);
    console.log('   Base de datos:', process.env.DB_NAME);
    console.log('   Usuario:', process.env.DB_USER);
    return false;
  }
};