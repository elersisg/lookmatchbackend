// src/services/usuario.service.js
require('dotenv').config();
const usuarioModel = require('../models/usuario.model');
const bcrypt       = require('bcrypt');
const nodemailer   = require('nodemailer');

// Configura el transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_HOST,
  port: parseInt(process.env.GMAIL_PORT, 10),
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * Registra un usuario nuevo
 */
async function registrarUsuario({ email, contrasena, telefono }) {
  const existente = await findUsuarioByEmail(email);
  if (existente) throw new Error('El correo ya está registrado');
  return await usuarioModel.registrarUsuario(email, contrasena, telefono);
}

/**
 * Busca un usuario por email (devuelve todos los campos de la tabla)
 */
async function findUsuarioByEmail(email) {
  return await usuarioModel.findUsuarioByEmail(email);
}

/**
 * Autentica un usuario (comprueba contraseña)
 */
async function authenticateUsuario(email, contrasena) {
  const usuario = await findUsuarioByEmail(email);
  if (!usuario) throw new Error('Usuario no encontrado');
  
  const valid = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!valid) throw new Error('Credenciales inválidas');
  
  return usuario;
}

/**
 * Genera y envía un código de recuperación por email
 */
async function solicitarCodigo(email) {
  const usuario = await findUsuarioByEmail(email);
  if (!usuario) throw new Error('Usuario no encontrado');

  const token_recuperacion = Math.floor(100000 + Math.random() * 900000).toString();
  const expiracion_token   = new Date(Date.now() + 3600_000); // 1 hora

  await usuarioModel.guardarTokenRecuperacion(email, token_recuperacion, expiracion_token);

  await transporter.sendMail({
    from: '"LookMatch Soporte" <no-reply@lookmatch.com>',
    to: email,
    subject: 'Código de recuperación',
    html: `<p>Tu código es: <strong>${token_recuperacion}</strong></p>`,
  });

  return 'Código enviado';
}

/**
 * Verifica que el token exista y no esté expirado
 */
async function verificarCodigo(token_recuperacion) {
  const row = await usuarioModel.verificarCodigo(token_recuperacion);
  if (!row || !row.email) throw new Error('Código inválido o expirado');
  return row;
}

/**
 * Restablece la contraseña usando el token de recuperación
 */
async function restablecerContrasena(contrasenaEncriptada, token_recuperacion) {
  await usuarioModel.restablecerContrasena(contrasenaEncriptada, token_recuperacion);
  await usuarioModel.eliminarTokenRecuperacion(token_recuperacion);
  return 'Contraseña actualizada';
}

/**
 * Actualiza el teléfono de un usuario
 */
async function actualizarTelefono(id_usuario, telefono) {
  if (!/^\d{10}$/.test(telefono)) {
    throw new Error('El teléfono debe tener exactamente 10 dígitos');
  }
  return await usuarioModel.actualizarTelefono(id_usuario, telefono);
}

/**
 * Verifica la contraseña actual de un usuario
 */
async function verificarContrasena(id_usuario, contrasena_actual) {
  const usuario = await usuarioModel.findUsuarioById(id_usuario);
  if (!usuario) throw new Error('Usuario no encontrado');
  return await bcrypt.compare(contrasena_actual, usuario.contrasena);
}

/**
 * Actualiza la contraseña de un usuario
 */
async function actualizarContrasena(id_usuario, contrasena_nueva, confirmar_contrasena) {
  if (contrasena_nueva !== confirmar_contrasena) {
    throw new Error('Las contraseñas no coinciden');
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(contrasena_nueva, salt);
  return await usuarioModel.actualizarContrasena(id_usuario, hash);
}

/**
 * Elimina la cuenta de un usuario tras verificar su contraseña
 */
async function eliminarUsuario(email, contrasena) {
  const usuario = await findUsuarioByEmail(email);
  if (!usuario) throw new Error('Usuario no encontrado');

  const valid = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!valid) throw new Error('Contraseña incorrecta');

  return await usuarioModel.eliminarUsuario(email);
}

/**
 * Busca un usuario por su ID
 */
async function findUsuarioById(id_usuario) {
  const usuario = await usuarioModel.findUsuarioById(id_usuario);
  if (!usuario) throw new Error('Usuario no encontrado');
  return usuario;
}

/**
 * --- Nuevo método ---
 * Obtiene sólo los campos esenciales del perfil a partir del email
 */
async function obtenerPerfilPorEmail(email) {
  const usuario = await usuarioModel.findUsuarioByEmail(email);
  if (!usuario) throw new Error('Usuario no encontrado');
  // Devuelvo únicamente lo que el frontend necesita
  return {
    id_usuario: usuario.id_usuario,
    email:      usuario.email,
    telefono:   usuario.telefono,
  };
}

module.exports = {
  registrarUsuario,
  authenticateUsuario,
  findUsuarioByEmail,
  findUsuarioById,
  solicitarCodigo,
  verificarCodigo,
  restablecerContrasena,
  actualizarTelefono,
  verificarContrasena,
  actualizarContrasena,
  eliminarUsuario,
  // exportamos el nuevo método
  obtenerPerfilPorEmail,
};
