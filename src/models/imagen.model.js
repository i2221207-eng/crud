const db = require('../config/db');

// Modelo para la tabla imagenes_productos
const Imagen = {
  // Obtener todas las imágenes de un producto
  getByProducto: async (productoId) => {
    try {
      const [rows] = await db.query('SELECT * FROM imagenes_productos WHERE producto_id = ?', [productoId]);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una imagen por ID
  getById: async (id) => {
    try {
      const [rows] = await db.query('SELECT * FROM imagenes_productos WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva imagen
  create: async (imagen) => {
    try {
      const [result] = await db.query(
        'INSERT INTO imagenes_productos (url, producto_id) VALUES (?, ?)', 
        [imagen.url, imagen.producto_id]
      );
      return { id: result.insertId, ...imagen };
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una imagen
  update: async (id, imagen) => {
    try {
      await db.query(
        'UPDATE imagenes_productos SET url = ?, producto_id = ? WHERE id = ?', 
        [imagen.url, imagen.producto_id, id]
      );
      return { id, ...imagen };
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una imagen
  delete: async (id) => {
    try {
      await db.query('DELETE FROM imagenes_productos WHERE id = ?', [id]);
      return { id };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Imagen;