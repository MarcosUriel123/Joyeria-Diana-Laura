// Ruta: Joyeria-Diana-Laura/Backend/src/scripts/direct-table-create.ts
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const createTableDirect = async () => {
  console.log('🔧 Iniciando creación de tabla...');
  
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { 
      rejectUnauthorized: false 
    },
    connectionTimeoutMillis: 30000,
  });

  try {
    console.log('🔄 Conectando a Railway...');
    await client.connect();
    console.log('✅ ¡Conectado a PostgreSQL!');

    // Verificar si la tabla ya existe
    console.log('🔍 Verificando si la tabla existe...');
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      )
    `);

    if (checkResult.rows[0].exists) {
      console.log('ℹ️ La tabla usuarios ya existe');
      return;
    }

    // Crear tabla
    console.log('🏗️ Creando tabla usuarios...');
    await client.query(`
      CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        firebase_uid VARCHAR(128) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nombre VARCHAR(100),
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP
      )
    `);
    console.log('✅ Tabla usuarios creada');

    // Crear índices
    console.log('📊 Creando índices...');
    await client.query('CREATE INDEX idx_usuarios_email ON usuarios(email)');
    await client.query('CREATE INDEX idx_usuarios_activo ON usuarios(activo)');
    await client.query('CREATE INDEX idx_usuarios_firebase_uid ON usuarios(firebase_uid)');
    console.log('✅ Índices creados');

    console.log('🎉 ¡TABLA CREADA EXITOSAMENTE!');
    console.log('🔄 Reinicia el servidor con: npm run dev');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    if (error.code === '42P07') {
      console.log('ℹ️ La tabla ya existe');
    } else if (error.code === '23505') {
      console.log('ℹ️ Los índices ya existen');
    } else {
      console.log('🔍 Código de error:', error.code);
      console.log('💡 Posibles soluciones:');
      console.log('   - Verifica tu conexión a internet');
      console.log('   - Verifica las credenciales en .env');
      console.log('   - Revisa que Railway esté activo');
    }
  } finally {
    await client.end();
    console.log('🔒 Conexión cerrada');
  }
};

createTableDirect();