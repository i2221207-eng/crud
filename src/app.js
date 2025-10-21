const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas
const categoriaRoutes = require('./routes/categoria.routes');
const productoRoutes = require('./routes/producto.routes');
const imagenRoutes = require('./routes/imagen.routes');
const authRoutes = require('./routes/auth.routes');

// Inicializar app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la interfaz de autenticación (debe ir antes que las APIs)
app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'auth.html'));
});

// Ruta para la interfaz de usuario (CRUD)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Rutas API
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/imagenes', imagenRoutes);
app.use('/auth', authRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Puerto
const PORT = 3001;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
