const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupTestData() {
  let connection;
  
  try {
    // Crear conexión a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Conectado a la base de datos');

    // Verificar si ya existe un usuario admin
    const [existingUsers] = await connection.execute('SELECT * FROM usuarios WHERE username = ?', ['admin']);
    
    if (existingUsers.length === 0) {
      // Crear usuario admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.execute(
        'INSERT INTO usuarios (username, password) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('Usuario admin creado (username: admin, password: admin123)');
    } else {
      console.log('Usuario admin ya existe');
    }

    // Verificar si ya existen categorías
    const [existingCategories] = await connection.execute('SELECT * FROM categorias');
    
    if (existingCategories.length === 0) {
      // Crear categorías de prueba
      const categorias = [
        'Electrónicos',
        'Ropa',
        'Hogar',
        'Deportes',
        'Libros'
      ];

      for (const categoria of categorias) {
        await connection.execute(
          'INSERT INTO categorias (nombre) VALUES (?)',
          [categoria]
        );
      }
      console.log('Categorías de prueba creadas');
    } else {
      console.log('Ya existen categorías en la base de datos');
    }

    console.log('Configuración de datos de prueba completada');
    
  } catch (error) {
    console.error('Error al configurar datos de prueba:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupTestData();