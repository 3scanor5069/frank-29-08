const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendEmail } = require('../services/emailService'); // tu servicio de envío de emails

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM cliente WHERE correo = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No existe una cuenta con ese email' });
    }

    const user = rows[0];
    const token = jwt.sign({ id: user.idCliente, email: user.correo }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const resetLink = `http://localhost:5173/Restablecer?token=${token}`;

    const subject = 'Recuperación de contraseña - Frank Furt';
    const text = `Hola ${user.nombre},\n\nPara restablecer tu contraseña haz clic en el siguiente enlace:\n${resetLink}\n\nSi no solicitaste este cambio, ignora este mensaje.`;
    const html = `
      <p>Hola <strong>${user.nombre}</strong>,</p>
      <p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>
      <p><a href="${resetLink}" style="background:#D00000; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Restablecer Contraseña</a></p>
      <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
      <hr/>
      <small>Frank Furt</small>
    `;

    await sendEmail(user.correo, subject, text, html);

    res.status(200).json({ message: 'Email de recuperación enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar email:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id;
    if (!userId) {
      return res.status(400).json({ message: 'Token inválido o corrupto' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('UPDATE cliente SET password = ? WHERE idCliente = ?', [hashedPassword, userId]);

    return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    return res.status(400).json({ message: 'Token inválido o expirado, solicita uno nuevo' });
  }
});

module.exports = router;
