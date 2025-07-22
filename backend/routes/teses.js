// backend/routes/teses.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const Tese = require('../models/Tese');
// Adicione a importação da biblioteca html-to-docx
const HTMLtoDOCX = require('html-to-docx');

// Criar pasta uploads se não existir
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Pasta uploads criada com sucesso');
}

// Rota existente para buscar tese por ID
router.get('/:id', async (req, res) => {
  try {
    // Verificar se o ID é válido para o MongoDB
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID de tese inválido' });
    }
    
    const tese = await Tese.findById(req.params.id);
    if (!tese) {
      return res.status(404).json({ message: 'Tese não encontrada' });
    }
    
    // Corrigir o formato do link se necessário
    if (tese.link && tese.link.startsWith('file:http')) {
      tese.link = tese.link.replace('file:', '');
    }
    
    res.json(tese);
  } catch (error) {
    console.error('Erro ao buscar tese por ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'text/csv'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xlsx, .xls) ou CSV são permitidos!'), false);
    }
  }
});

// Rota para listar todas as teses
router.get('/', async (req, res) => {
  try {
    const teses = await Tese.find().sort({ createdAt: -1 });
    res.json(teses);
  } catch (err) {
    console.error('Erro ao buscar teses:', err);
    res.status(500).json({ error: 'Erro ao buscar teses', message: err.message });
  }
});

// Função para processar os assuntos separados por ||
function processarAssuntos(assuntosString) {
  if (!assuntosString) return [];
  return assuntosString.split('||').map(assunto => assunto.trim()).filter(Boolean);
}

// Rota para importar Excel
router.post('/importar-excel', upload.single('arquivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log('Arquivo recebido:', req.file);
    
    // Ler o arquivo Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`Processando ${data.length} registros do Excel`);
    
    // Mapear os dados para o formato do modelo
    const tesesParaImportar = data.map(item => ({
      identificador: item.Identificador?.toString() || '',
      titulo: item.Título || '',
      descricao: item.Descrição || '',
      area: item.Área || '',
      assuntos: processarAssuntos(item.Assunto_separados),
      profissionalCatalogador: item.Profissional_catalogador || '',
      data: item.Data ? new Date(item.Data) : null,
      atualizacao: item.Ano_e_mês_atualização || '',
      status: item.special_item_status || '',
      commentStatus: item.special_comment_status || '',
      documento: item.special_document || '',
      link: item.link || ''
    }));
    
    // Filtrar registros inválidos (sem identificador ou título)
    const tesesValidas = tesesParaImportar.filter(tese => 
      tese.identificador.trim() !== '' && tese.titulo.trim() !== ''
    );
    
    if (tesesValidas.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhum registro válido encontrado no Excel',
        detalhes: 'Os registros devem ter pelo menos identificador e título preenchidos'
      });
    }
    
    // Inserir no banco de dados (com upsert para evitar duplicatas)
    let inseridos = 0;
    let atualizados = 0;
    let erros = 0;
    
    for (const tese of tesesValidas) {
      try {
        const resultado = await Tese.findOneAndUpdate(
          { identificador: tese.identificador },
          tese,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        if (resultado._id) {
          if (resultado.isNew) {
            inseridos++;
          } else {
            atualizados++;
          }
        }
      } catch (err) {
        console.error(`Erro ao processar tese ${tese.identificador}:`, err);
        erros++;
      }
    }
    
    // Remover o arquivo após processamento
    fs.unlinkSync(req.file.path);
    
    res.status(201).json({ 
      message: 'Importação concluída com sucesso', 
      inseridos,
      atualizados,
      erros,
      total: data.length,
      invalidos: data.length - tesesValidas.length
    });
    
  } catch (err) {
    console.error('Erro ao processar arquivo Excel:', err);
    res.status(500).json({ 
      error: 'Erro ao processar arquivo Excel', 
      message: err.message 
    });
  }
});

// NOVA ROTA: Endpoint para converter HTML para DOCX
router.post('/convert/html-to-docx', async (req, res) => {
  try {
    const { html, filename } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'Conteúdo HTML é obrigatório' });
    }
    
    console.log('Iniciando conversão de HTML para DOCX...');
    
    // Configurações para a conversão
    const options = {
      margin: {
        top: 1440, // 1 polegada (em twips)
        right: 1440,
        bottom: 1440,
        left: 1440
      },
      title: filename || 'Documento',
      pageNumbers: true,
    };
    
    // Converter HTML para DOCX
    const docxBuffer = await HTMLtoDOCX(html, null, options);
    
    console.log('Conversão concluída com sucesso');
    
    // Definir cabeçalhos para download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'documento'}.docx"`);
    
    // Enviar o buffer como resposta
    res.send(docxBuffer);
    
  } catch (error) {
    console.error('Erro na conversão HTML para DOCX:', error);
    res.status(500).json({ 
      error: 'Erro na conversão para DOCX', 
      details: error.message 
    });
  }
});

module.exports = router;
