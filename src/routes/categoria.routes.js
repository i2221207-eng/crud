const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas para categorías
router.get('/', categoriaController.getAll);
router.get('/:id', categoriaController.getById);
router.post('/', authMiddleware, categoriaController.create);
router.put('/:id', authMiddleware, categoriaController.update);
router.delete('/:id', authMiddleware, categoriaController.delete);



module.exports = router;