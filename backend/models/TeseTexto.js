// backend/models/TeseTexto.js
const mongoose = require('mongoose');

const TeseTextoSchema = new mongoose.Schema({
  teseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tese',
    required: true
  },
  identificadorTese: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  texto: {
    type: String,
    required: true
  },
  ultimaAtualizacao: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Índice composto para busca eficiente
TeseTextoSchema.index({ teseId: 1, userId: 1 }, { unique: true });
// Índice adicional para busca por identificador
TeseTextoSchema.index({ identificadorTese: 1, userId: 1 });

module.exports = mongoose.model('TeseTexto', TeseTextoSchema);
