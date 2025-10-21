const Imagen = require('../models/imagen.model');
const path = require('path');
const fs = require('fs');

// Controlador para imágenes de productos
const ImagenController = {
  // Obtener todas las imágenes de un producto
  getByProducto: async (req, res) => {
    try {
      const productoId = req.params.productoId;
      const imagenes = await Imagen.getByProducto(productoId);
      res.json(imagenes);
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
      res.status(500).json({ message: 'Error al obtener imágenes' });
    }
  },

  // Subir una nueva imagen para un producto
  upload: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
      }

      const productoId = req.params.productoId;
      const fileName = req.file.filename;
      const url = `/uploads/${fileName}`;
      
      const nuevaImagen = await Imagen.create({
        url,
        producto_id: productoId
      });
      
      res.status(201).json(nuevaImagen);
    } catch (error) {
      console.error('Error al subir imagen:', error);
      res.status(500).json({ message: 'Error al subir imagen' });
    }
  },

  // Eliminar una imagen
  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const imagen = await Imagen.getById(id);
      
      if (!imagen) {
        return res.status(404).json({ message: 'Imagen no encontrada' });
      }
      
      // Eliminar el archivo físico
      const filePath = path.join(__dirname, '../public', imagen.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      await Imagen.delete(id);
      res.json({ message: 'Imagen eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      res.status(500).json({ message: 'Error al eliminar imagen' });
    }
  }
};

module.exports = ImagenController;