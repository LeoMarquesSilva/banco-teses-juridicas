// backend/models/Tese.js
const mongoose = require('mongoose');

const TeseSchema = new mongoose.Schema({
  identificador: {
    type: String,
    required: true,
    unique: true
  },
  titulo: {
    type: String,
    required: true
  },
  descricao: String,
  area: String,
  assuntos: [String],
  profissionalCatalogador: String,
  data: Date,
  atualizacao: String,
  status: String,
  commentStatus: String,
  documento: String,
  link: String,
  dataImportacao: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Tese', TeseSchema);
