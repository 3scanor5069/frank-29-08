const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'mi_secreto_para_tokens';

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM cliente WHERE correo = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'No existe un usuario con ese correo' });
    }

    const user = users[0];

    // Generar token válido por 15 minutos
    const token = jwt.sign({ idCliente: user.idCliente }, SECRET, { expiresIn: '15m' });

    const resetLink = `http://localhost:3000/Restablecer?token=${token}`;

    console.log(`Enlace de recuperación generado: ${resetLink}`);

    // Aquí podrías enviar el email real con nodemailer si lo deseas

    res.json({
      message: 'Se ha enviado el enlace de recuperación al correo (simulado)',
      resetLink
    });
  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, SECRET);

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('UPDATE cliente SET password = ? WHERE idCliente = ?', [
      hashedPassword,
      decoded.idCliente
    ]);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en resetPassword:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'El enlace ha expirado' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Token inválido' });
    }

    res.status(500).json({ message: 'Error del servidor' });
  }
};
