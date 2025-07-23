// backend/config/default.js
module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/teses_db',
  jwtSecret: process.env.JWT_SECRET || 'mesmo_segredo_usado_pelo_n8n', // Use a mesma chave do n8n
};
