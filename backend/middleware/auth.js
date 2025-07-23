// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/default');

module.exports = function(req, res, next) {
  // Obter token do header
  const token = req.header('x-auth-token');

  // Verificar se não há token
  if (!token) {
    return res.status(401).json({ msg: 'Sem token, autorização negada' });
  }

  try {
    // Verificar token (usando a mesma chave secreta que o n8n usa)
    const decoded = jwt.verify(token, config.jwtSecret);

    // Adicionar usuário ao request
    req.user = decoded.user || decoded; // Ajuste conforme o formato do token do n8n
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido' });
  }
};
