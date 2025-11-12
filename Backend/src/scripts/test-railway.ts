// Ruta: Joyeria-Diana-Laura/Backend/src/scripts/test-railway.ts
import { pool, testConnection } from '../config/database';

const testRailwayConnection = async () => {
  console.log('🚄 Probando conexión con Railway...');
  
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ No se pudo conectar a Railway');
    process.exit(1);
  }

  try {
    // Probar operaciones CRUD básicas
    console.log('🧪 Probando operaciones...');
    
    // 1. Insertar usuario de prueba
    const testEmail = `test-railway-${Date.now()}@joyeria.com`;
    const insertResult = await pool.query(
      `INSERT INTO usuarios (email, password_hash, nombre, firebase_uid) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, nombre`,
      [testEmail, 'hashed_password_railway', 'Test Railway', `test-uid-${Date.now()}`]
    );
    
    console.log('✅ Usuario insertado:', insertResult.rows[0]);

    // 2. Leer el usuario insertado
    const readResult = await pool.query(
      'SELECT id, email, nombre FROM usuarios WHERE email = $1',
      [testEmail]
    );
    
    console.log('✅ Usuario leído:', readResult.rows[0]);

    // 3. Actualizar usuario
    const updateResult = await pool.query(
      'UPDATE usuarios SET nombre = $1 WHERE email = $2 RETURNING nombre',
      ['Test Railway Actualizado', testEmail]
    );
    
    console.log('✅ Usuario actualizado:', updateResult.rows[0]);

    // 4. Eliminar usuario de prueba
    const deleteResult = await pool.query(
      'DELETE FROM usuarios WHERE email = $1',
      [testEmail]
    );
    
    console.log('✅ Usuario de prueba eliminado');

    // 5. Contar usuarios totales
    const countResult = await pool.query('SELECT COUNT(*) as total_usuarios FROM usuarios');
    console.log('📊 Total de usuarios en Railway:', countResult.rows[0].total_usuarios);

    console.log('🎉 ¡Todas las pruebas pasaron! Railway está funcionando correctamente.');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await pool.end();
  }
};

testRailwayConnection();