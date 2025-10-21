const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware de autenticación JWT
 * Verifica que el token JWT sea válido antes de permitir el acceso a rutas protegidas
 */
const authMiddleware = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        message: 'Token de acceso requerido. Debes iniciar sesión para realizar esta acción.' 
      });
    }

    // Verificar que el header tenga el formato "Bearer token"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Formato de token inválido. Usa: Bearer <token>' 
      });
    }

    // Verificar el token JWT
    const secretKey = process.env.JWT_SECRET || 'secreto123';
    const decoded = jwt.verify(token, secretKey);
    
    // Agregar la información del usuario decodificada al request
    req.user = decoded;
    
    // Continuar con el siguiente middleware o controlador
    next();
    
  } catch (error) {
    // Manejar diferentes tipos de errores JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado. Por favor, inicia sesión nuevamente.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido. Acceso denegado.' 
      });
    }
    
    // Error genérico
    return res.status(500).json({ 
      message: 'Error interno del servidor al verificar autenticación.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = authMiddleware;