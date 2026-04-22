/**
 * Middleware de autenticación usando Firebase Admin SDK
 * Verifica el JWT token y extrae el userId
 */

const { auth } = require('firebase-admin');

/**
 * Middleware para verificar JWT y extraer usuario
 * 
 * Expects: Authorization header con formato "Bearer <token>"
 * 
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express  
 * @param {Function} next - Next middleware
 */
const authenticate = async (req, res, next) => {
  // Extraer token del header Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No Authorization header provided'
    });
  }

  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid Authorization header format. Use: Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    // Verificar el token con Firebase Admin SDK
    const decodedToken = await auth().verifyIdToken(token);
    
    // Agregar el userId al request para uso en las rutas
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email || null;
    req.userData = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || null,
      photoURL: decodedToken.picture || null
    };
    
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);
    
    // Errores específicos de Firebase Auth
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired. Please login again'
      });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token verification failed'
    });
  }
};

/**
 * Middleware opcional - permite requests autenticados o anónimas
 * Útil para endpoints públicos que quieres adaptar después
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // Sin token - usuario anónimo
    req.userId = 'anonymous';
    req.userData = null;
    return next();
  }

  // Intentar verificar - si falla, permitir anónimo
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    req.userId = 'anonymous';
    req.userData = null;
    return next();
  }

  try {
    const decodedToken = await auth().verifyIdToken(parts[1]);
    req.userId = decodedToken.uid;
    req.userData = decodedToken;
    next();
  } catch (error) {
    // Token inválido pero permitimos request
    req.userId = 'anonymous';
    req.userData = null;
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};