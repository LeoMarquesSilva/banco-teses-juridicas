// backend/models/Tese.js (adicione o campo texto)
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
  // Novo campo para armazenar o texto da tese
  texto: {
    type: String,
    default: ''
  },
  ultimaAtualizacaoTexto: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Tese', TeseSchema);
