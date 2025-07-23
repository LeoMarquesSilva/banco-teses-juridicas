// backend/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Rota para registrar um usuário
// POST /api/users
router.post('/', async (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  try {
    // Verificar se o usuário já existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Usuário já existe' });
    }

    // Criar novo usuário
    user = new User({
      nome,
      email,
      senha,
      perfil: perfil || 'usuario'
    });

    // Criptografar senha
    const salt = await bcrypt.genSalt(10);
    user.senha = await bcrypt.hash(senha, salt);

    // Salvar usuário
    await user.save();

    // Gerar JWT
    const payload = {
      user: {
        id: user.id,
        perfil: user.perfil
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Erro ao registrar usuário:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para listar todos os usuários (apenas admin)
// GET /api/users
router.get('/', auth, async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.perfil !== 'admin') {
      return res.status(403).json({ msg: 'Acesso negado' });
    }

    const users = await User.find().select('-senha');
    res.json(users);
  } catch (err) {
    console.error('Erro ao listar usuários:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
