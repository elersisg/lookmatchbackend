const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * /usuario/registro:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               contrasena:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 */
router.post('/registro', usuarioController.registrarUsuario);

/**
 * @swagger
 * /usuario/autenticar:
 *   post:
 *     summary: Autenticar un usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 */
router.post('/autenticar', usuarioController.autenticarUsuario);

/**
 * @swagger
 * /usuario/solicitar-codigo:
 *   post:
 *     summary: Solicitar código de recuperación de contraseña
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *     responses:
 *       200:
 *         description: Código enviado con éxito
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/solicitar-codigo', usuarioController.solicitarCodigo);

/**
 * @swagger
 * /usuario/verificar-codigo:
 *   post:
 *     summary: Verificar código de recuperación de contraseña
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token_recuperacion:
 *                 type: string
 *                 description: Código de verificación enviado al usuario
 *     responses:
 *       200:
 *         description: Código verificado correctamente
 *       400:
 *         description: Código inválido o expirado
 */
router.post('/verificar-codigo', usuarioController.verificarCodigo);

/**
 * @swagger
 * /usuario/restablecer-contrasena:
 *   post:
 *     summary: Restablecer contraseña
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nuevaContrasena:
 *                 type: string
 *                 description: Nueva contraseña del usuario
 *               confirmarContrasena:
 *                 type: string
 *                 description: Confirmar nueva contraseña del usuario
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Las contraseñas no coinciden
 *       404:
 *         description: No se ha verificado el código de recuperación
 */
router.post('/restablecer-contrasena', usuarioController.restablecerContrasena);

/**
 * @swagger
 * components:
 *   schemas:
 *     ActualizarTelefonoDTO:
 *       type: object
 *       required:
 *         - telefono
 *       properties:
 *         telefono:
 *           type: string
 *           pattern: '^\d{10}$'
 *     VerificarContrasenaDTO:
 *       type: object
 *       required:
 *         - contrasena_actual
 *       properties:
 *         contrasena_actual:
 *           type: string
 *     ActualizarContrasenaDTO:
 *       type: object
 *       required:
 *         - contrasena_nueva
 *         - confirmar_contrasena
 *       properties:
 *         contrasena_nueva:
 *           type: string
 *           minLength: 8
 *         confirmar_contrasena:
 *           type: string
 */

/**
 * @swagger
 * /usuario/telefono:
 *   patch:
 *     summary: Actualizar teléfono del usuario
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarTelefonoDTO'
 *     responses:
 *       200:
 *         description: Teléfono actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.patch('/telefono', usuarioController.actualizarTelefono);

/**
 * @swagger
 * /usuario/verificar-contrasena:
 *   post:
 *     summary: Verificar contraseña actual
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerificarContrasenaDTO'
 *     responses:
 *       200:
 *         description: Contraseña verificada correctamente
 *       401:
 *         description: Contraseña incorrecta
 *       400:
 *         description: Datos inválidos
 */
router.post('/verificar-contrasena', usuarioController.verificarContrasena);

/**
 * @swagger
 * /usuario/contrasena:
 *   patch:
 *     summary: Actualizar contraseña
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarContrasenaDTO'
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Datos inválidos o contraseñas no coinciden
 *       401:
 *         description: No autorizado
 */
router.patch('/contrasena', usuarioController.actualizarContrasena);

/**
 * @swagger
 * /usuario/eliminar:
 *   delete:
 *     summary: Eliminar cuenta de usuario
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               contrasena:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Cuenta eliminada exitosamente
 *       400:
 *         description: Datos inválidos o contraseña incorrecta
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permiso para eliminar esta cuenta
 */
router.delete('/eliminar', usuarioController.eliminarUsuario);


module.exports = router;