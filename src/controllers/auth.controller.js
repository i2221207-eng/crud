const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); // Conexión a la base de datos
require('dotenv').config();

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // guardar en la BD
    await db.query("INSERT INTO usuarios (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);

    res.json({ message: "Usuario registrado" });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query("SELECT * FROM usuarios WHERE username = ?", [username]);
    const user = rows[0];

    if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

    // validar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Contraseña incorrecta" });

    // generar token JWT
    const secretKey = process.env.JWT_SECRET || 'secreto123';
    const token = jwt.sign(
      { id: user.id, username: user.username },
      secretKey,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el login", error });
  }
};
