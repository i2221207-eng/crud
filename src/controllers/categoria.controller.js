const Categoria = require('../models/categoria.model');

// Controlador para categorías
const CategoriaController = {
  // Obtener todas las categorías
  getAll: async (req, res) => {
    try {
      const categorias = await Categoria.getAll();
      res.json(categorias);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ message: 'Error al obtener categorías' });
    }
  },

  // Obtener una categoría por ID
  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const categoria = await Categoria.getById(id);
      
      if (!categoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      res.json(categoria);
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({ message: 'Error al obtener categoría' });
    }
  },

  // Crear una nueva categoría
  create: async (req, res) => {
    try {
      const { nombre } = req.body;
      
      if (!nombre) {
        return res.status(400).json({ message: 'El nombre de la categoría es requerido' });
      }
      
      const nuevaCategoria = await Categoria.create({ nombre });
      res.status(201).json(nuevaCategoria);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      res.status(500).json({ message: 'Error al crear categoría' });
    }
  },

  // Actualizar una categoría
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { nombre } = req.body;
      
      if (!nombre) {
        return res.status(400).json({ message: 'El nombre de la categoría es requerido' });
      }
      
      const categoriaExistente = await Categoria.getById(id);
      
      if (!categoriaExistente) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      const categoriaActualizada = await Categoria.update(id, { nombre });
      res.json(categoriaActualizada);
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({ message: 'Error al actualizar categoría' });
    }
  },

  // Eliminar una categoría
  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const categoriaExistente = await Categoria.getById(id);
      
      if (!categoriaExistente) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      await Categoria.delete(id);
      res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({ message: 'Error al eliminar categoría' });
    }
  }
};

module.exports = CategoriaController;