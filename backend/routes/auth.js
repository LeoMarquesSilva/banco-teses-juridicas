// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Rota para autenticar usuário e obter token
// POST /api/auth
router.post('/', async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Verificar se o usuário existe
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

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
    console.error('Erro no login:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para obter dados do usuário logado
// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-senha');
    res.json(user);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
