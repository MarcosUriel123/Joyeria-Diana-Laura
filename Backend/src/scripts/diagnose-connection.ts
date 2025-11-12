// Ruta: Joyeria-Diana-Laura/Backend/src/scripts/diagnose-connection.ts
import { pool } from '../config/database';

const diagnoseConnection = async () => {
  console.log('🔍 Diagnosticando conexión a Railway...');
  
  try {
    console.log('1. Probando conexión básica...');
    const client = await pool.connect();
    console.log('   ✅ Conexión establecida');
    
    console.log('2. Probando consulta simple...');
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('   ✅ Hora del servidor:', timeResult.rows[0].current_time);
    
    console.log('3. Verificando tabla usuarios...');
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('   📋 Tablas disponibles:', tableResult.rows.map(row => row.table_name));
    
    console.log('4. Verificando estructura de usuarios...');
    try {
      const structureResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'usuarios'
        ORDER BY ordinal_position
      `);
      console.log('   🏗️  Estructura de usuarios:');
      structureResult.rows.forEach(col => {
        console.log(`      - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log('   ❌ La tabla usuarios no existe o tiene problemas');
    }
    
    client.release();
    console.log('🎉 Diagnóstico completado - Todo funciona correctamente');
    
  } catch (error: any) {
    console.error('❌ Error en diagnóstico:', error.message);
    console.log('💡 Posibles soluciones:');
    console.log('   - Verifica las credenciales en .env');
    console.log('   - Verifica que la BD exista en Railway');
    console.log('   - Verifica el firewall/red');
  } finally {
    await pool.end();
  }
};

diagnoseConnection();