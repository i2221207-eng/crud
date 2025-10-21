const Producto = require('../models/producto.model');
const Imagen = require('../models/imagen.model');

// Controlador para productos
const ProductoController = {
  // Obtener todos los productos
  getAll: async (req, res) => {
    try {
      const productos = await Producto.getAll();
      
      // Obtener las imágenes para cada producto
      for (let producto of productos) {
        const imagenes = await Imagen.getByProducto(producto.id);
        producto.imagenes = imagenes;
      }
      
      res.json(productos);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ message: 'Error al obtener productos' });
    }
  },

  // Obtener productos por categoría
  getByCategoria: async (req, res) => {
    try {
      const categoriaId = req.params.categoriaId;
      const productos = await Producto.getByCategoria(categoriaId);
      
      // Obtener las imágenes para cada producto
      for (let producto of productos) {
        const imagenes = await Imagen.getByProducto(producto.id);
        producto.imagenes = imagenes;
      }
      
      res.json(productos);
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      res.status(500).json({ message: 'Error al obtener productos por categoría' });
    }
  },

  // Obtener un producto por ID
  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const producto = await Producto.getById(id);
      
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Obtener las imágenes del producto
      const imagenes = await Imagen.getByProducto(id);
      producto.imagenes = imagenes;
      
      res.json(producto);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ message: 'Error al obtener producto' });
    }
  },

  // Crear un nuevo producto
  create: async (req, res) => {
    try {
      const { nombre, descripcion, precio, categoria_id } = req.body;
      
      if (!nombre || !descripcion || !precio || !categoria_id) {
        return res.status(400).json({ 
          message: 'Todos los campos son requeridos: nombre, descripcion, precio, categoria_id' 
        });
      }
      
      const nuevoProducto = await Producto.create({ 
        nombre, 
        descripcion, 
        precio, 
        categoria_id 
      });
      
      // Si hay una imagen, guardarla
      if (req.file) {
        const fileName = req.file.filename;
        const url = `/uploads/${fileName}`;
        
        await Imagen.create({
          url,
          producto_id: nuevoProducto.id
        });
      }
      
      res.status(201).json(nuevoProducto);
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ message: 'Error al crear producto' });
    }
  },

  // Actualizar un producto
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { nombre, descripcion, precio, categoria_id } = req.body;
      
      if (!nombre || !descripcion || !precio || !categoria_id) {
        return res.status(400).json({ 
          message: 'Todos los campos son requeridos: nombre, descripcion, precio, categoria_id' 
        });
      }
      
      const productoExistente = await Producto.getById(id);
      
      if (!productoExistente) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      const productoActualizado = await Producto.update(id, { 
        nombre, 
        descripcion, 
        precio, 
        categoria_id 
      });
      
      // Si hay una imagen nueva, guardarla
      if (req.file) {
        const fileName = req.file.filename;
        const url = `/uploads/${fileName}`;
        
        // Verificar si ya tiene imágenes
        const imagenes = await Imagen.getByProducto(id);
        
        if (imagenes && imagenes.length > 0) {
          // Actualizar la primera imagen
          await Imagen.update(imagenes[0].id, {
            url,
            producto_id: id
          });
        } else {
          // Crear una nueva imagen
          await Imagen.create({
            url,
            producto_id: id
          });
        }
      }
      
      res.json(productoActualizado);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ message: 'Error al actualizar producto' });
    }
  },

  // Eliminar un producto
  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const productoExistente = await Producto.getById(id);
      
      if (!productoExistente) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      // Obtener las imágenes asociadas al producto
      const imagenes = await Imagen.getByProducto(id);
      
      // Eliminar las imágenes físicas del servidor
      const fs = require('fs');
      const path = require('path');
      
      for (const imagen of imagenes) {
        try {
          const rutaImagen = path.join(__dirname, '../../src/public', imagen.url);
          if (fs.existsSync(rutaImagen)) {
            fs.unlinkSync(rutaImagen);
          }
        } catch (err) {
          console.error('Error al eliminar archivo de imagen:', err);
          // Continuar con el proceso aunque falle la eliminación del archivo
        }
      }
      
      // La eliminación de registros en la base de datos se maneja automáticamente
      // gracias a la restricción ON DELETE CASCADE en la tabla imagenes_productos
      
      await Producto.delete(id);
      res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ message: 'Error al eliminar producto' });
    }
  }
};

module.exports = ProductoController;