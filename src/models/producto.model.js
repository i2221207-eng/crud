const db = require('../config/db');

// Modelo para la tabla productos
const Producto = {
  // Obtener todos los productos
  getAll: async () => {
    try {
      const [rows] = await db.query(`
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        JOIN categorias c ON p.categoria_id = c.id
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Obtener productos por categoría
  getByCategoria: async (categoriaId) => {
    try {
      const [rows] = await db.query(`
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        JOIN categorias c ON p.categoria_id = c.id 
        WHERE p.categoria_id = ?
      `, [categoriaId]);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un producto por ID
  getById: async (id) => {
    try {
      const [rows] = await db.query(`
        SELECT p.*, c.nombre as categoria_nombre 
        FROM productos p 
        JOIN categorias c ON p.categoria_id = c.id 
        WHERE p.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo producto
  create: async (producto) => {
    try {
      const [result] = await db.query(
        'INSERT INTO productos (nombre, descripcion, precio, categoria_id) VALUES (?, ?, ?, ?)', 
        [producto.nombre, producto.descripcion, producto.precio, producto.categoria_id]
      );
      return { id: result.insertId, ...producto };
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un producto
  update: async (id, producto) => {
    try {
      await db.query(
        'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ? WHERE id = ?', 
        [producto.nombre, producto.descripcion, producto.precio, producto.categoria_id, id]
      );
      return { id, ...producto };
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un producto
  delete: async (id) => {
    try {
      await db.query('DELETE FROM productos WHERE id = ?', [id]);
      return { id };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Producto;