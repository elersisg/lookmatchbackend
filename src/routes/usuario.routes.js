const express = require('express');
const router  = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { authenticateToken } = require('../middleware/auth.middleware.js');



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
 *               confirmarContrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Contraseñas no coinciden o datos inválidos
 */
router.post('/restablecer-contrasena', usuarioController.restablecerContrasena);


/**
 * Todas las rutas siguientes requieren un JWT válido
 */
router.use(authenticateToken);

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
 *             type: object
 *             required: [telefono]
 *             properties:
 *               telefono:
 *                 type: string
 *                 pattern: '^\d{10}$'
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
 *             type: object
 *             required: [contrasena_actual]
 *             properties:
 *               contrasena_actual:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña verificada correctamente
 *       401:
 *         description: Contraseña incorrecta o no autorizado
 *       400:
 *         description: Datos inválidos
 */
router.post('/verificar-contrasena', usuarioController.verificarContrasena);

/**
 * @swagger
 * /usuario/perfil:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_usuario:
 *                   type: integer
 *                   example: 12
 *                 email:
 *                   type: string
 *                   example: "juan@ejemplo.com"
 *                 telefono:
 *                   type: string
 *                   example: "5512345678"
 *       401:
 *         description: No autorizado (token faltante o inválido)
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/perfil', authenticateToken, usuarioController.obtenerPerfilPorEmail);

/**
 * @swagger
 * /usuario/contrasena:
 *   patch:
 *     summary: Actualizar contraseña del usuario
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contrasena_nueva, confirmar_contrasena]
 *             properties:
 *               contrasena_nueva:
 *                 type: string
 *               confirmar_contrasena:
 *                 type: string
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
 *             required: [contrasena]
 *             properties:
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cuenta eliminada exitosamente
 *       400:
 *         description: Datos inválidos o contraseña incorrecta
 *       401:
 *         description: No autorizado
 */
router.delete('/eliminar', usuarioController.eliminarUsuario);



module.exports = router;
