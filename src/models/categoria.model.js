const db = require('../config/db');

// Modelo para la tabla categorias
const Categoria = {
  // Obtener todas las categorías
  getAll: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM categorias');
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una categoría por ID
  getById: async (id) => {
    try {
      const [rows] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva categoría
  create: async (categoria) => {
    try {
      const [result] = await db.query('INSERT INTO categorias (nombre) VALUES (?)', [categoria.nombre]);
      return { id: result.insertId, ...categoria };
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una categoría
  update: async (id, categoria) => {
    try {
      await db.query('UPDATE categorias SET nombre = ? WHERE id = ?', [categoria.nombre, id]);
      return { id, ...categoria };
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una categoría
  delete: async (id) => {
    try {
      await db.query('DELETE FROM categorias WHERE id = ?', [id]);
      return { id };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Categoria;