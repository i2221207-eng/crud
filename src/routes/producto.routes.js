const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const multer = require('multer');
const path = require('path');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../src/public/uploads/'));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif)'));
  }
});

// Rutas para productos
router.get('/', productoController.getAll);
router.get('/categoria/:categoriaId', productoController.getByCategoria);
router.get('/:id', productoController.getById);
router.post('/', upload.single('imagen'), productoController.create);
router.put('/:id', upload.single('imagen'), productoController.update);
router.delete('/:id', productoController.delete);

module.exports = router;