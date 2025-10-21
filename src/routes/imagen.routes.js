const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const imagenController = require('../controllers/imagen.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/'));
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

// Rutas para imágenes
router.get('/producto/:productoId', imagenController.getByProducto);
router.post('/producto/:productoId', authMiddleware, upload.single('imagen'), imagenController.upload);
router.delete('/:id', authMiddleware, imagenController.delete);

module.exports = router;