const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware.js');
const prendaController = require('../controllers/prenda.controller');
router.use(authenticateToken);  // a partir de aquí, todo requiere JWT

/**
 * @swagger
 * tags:
 *   name: Prendas
 *   description: Gestión de prendas
 */

/**
 * @swagger
 * /prenda/subir-imagen:
 *   post:
 *     summary: Subir una imagen para una nueva prenda
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *             required:
 *               - image
 *     responses:
 *       200:
 *         description: Imagen subida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 public_id:
 *                   type: string
 *                 secure_url:
 *                   type: string
 *       400:
 *         description: Error al subir la imagen
 */
router.post('/subir-imagen', authenticateToken, prendaController.subirImagen);


/**
 * @swagger
 * /prenda/registro:
 *   post:
 *     summary: Registrar prenda
 *     description: |
 *       Registra una nueva prenda. Requiere la URL de la imagen subida previamente.
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_prenda
 *               - nombre_categoria
 *               - nombre_subcategoria
 *               - estilo
 *               - color_principal
 *               - ruta  # ← Añadido como campo requerido
 *             properties:
 *               nombre_prenda:
 *                 type: string
 *               nombre_categoria:
 *                 type: string
 *               nombre_subcategoria:
 *                 type: string
 *               estilo:
 *                 type: string
 *                 enum: [Casual, Formal, Deportivo, Semiformal]
 *               color_principal:
 *                 type: string
 *               color_secundario:
 *                 type: string
 *               ruta:  # ← Nuevo campo documentado
 *                 type: string
 *                 description: URL de la imagen subida a Cloudinary
 *                 example: "https://res.cloudinary.com/tu_cloud/image/upload/v1234567/ejemplo.jpg"
 *     responses:
 *       201:
 *         description: Prenda registrada exitosamente
 *       400:
 *         description: Datos inválidos o falta la URL de la imagen
 *       401:
 *         description: No autorizado
 */
router.post('/registro', authenticateToken, prendaController.registrar);

/**
 * @swagger
 * /prenda:
 *   get:
 *     summary: Obtener todas las prendas del usuario
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de prendas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_prenda:
 *                     type: integer
 *                   nombre_prenda:
 *                     type: string
 *                   nombre_categoria:
 *                     type: string
 *                   nombre_subcategoria:
 *                     type: string
 *                   estilo:
 *                     type: string
 *                   color_principal:
 *                     type: string
 *                   color_secundario:
 *                     type: string
 *                   ruta_imagen:
 *                     type: string
 *                   status:
 *                     type: boolean
 *       401:
 *         description: Token no válido o no enviado
 *       500:
 *         description: Error al obtener las prendas
 */
router.get('/obtener-prenda', authenticateToken, prendaController.obtenerPrendasUsuario);

/**
 * @swagger
 * /prenda/filtrar/subcategoria/{subcategoria}:
 *   get:
 *     summary: Filtrar prendas por subcategoría
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subcategoria
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la subcategoría
 *     responses:
 *       200:
 *         description: Lista de prendas filtradas
 *       401:
 *         description: Token no válido o no enviado
 *       500:
 *         description: Error al obtener las prendas
 */
router.get('/filtrar/subcategoria/:subcategoria', authenticateToken, prendaController.filtrarPorSubcategoria);

/**
 * @swagger
 * /prenda/filtrar/color/{color}:
 *   get:
 *     summary: Filtrar prendas por color principal
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: color
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del color principal
 *     responses:
 *       200:
 *         description: Lista de prendas filtradas
 *       401:
 *         description: Token no válido o no enviado
 *       500:
 *         description: Error al obtener las prendas
 */
router.get('/filtrar/color/:color', authenticateToken, prendaController.filtrarPorColor);

/**
 * @swagger
 * /prenda/filtrar/estilo/{estilo}:
 *   get:
 *     summary: Filtrar prendas por estilo
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estilo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Formal, Casual, Deportivo, Semiformal]
 *         description: Estilo de la prenda
 *     responses:
 *       200:
 *         description: Lista de prendas filtradas
 *       401:
 *         description: Token no válido o no enviado
 *       500:
 *         description: Error al obtener las prendas
 */
router.get('/filtrar/estilo/:estilo', authenticateToken, prendaController.filtrarPorEstilo);

/**
 * @swagger
 * /prenda/buscar/{nombre}:
 *   get:
 *     summary: Buscar prendas por nombre
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Texto a buscar en nombres de prendas
 *     responses:
 *       200:
 *         description: Lista de prendas encontradas
 *       401:
 *         description: Token no válido o no enviado
 *       500:
 *         description: Error al obtener las prendas
 */
router.get('/buscar/:nombre', authenticateToken, prendaController.buscarPorNombre);


/**
 * @swagger
 * /prenda/{id}/nombre:
 *   patch:
 *     summary: Actualizar nombre de prenda
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la prenda a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_prenda
 *             properties:
 *               nombre_prenda:
 *                 type: string
 *                 example: "Camiseta manga larga"
 *     responses:
 *       200:
 *         description: Nombre actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Prenda no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/nombre', authenticateToken, prendaController.actualizarNombre);

/**
 * @swagger
 * /prenda/{id}/estilo:
 *   patch:
 *     summary: Actualizar estilo de prenda
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la prenda a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estilo
 *             properties:
 *               estilo:
 *                 type: string
 *                 enum: ["Casual", "Formal", "Deportivo", "Semiformal"]
 *                 example: "Casual"
 *     responses:
 *       200:
 *         description: Estilo actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Prenda no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/estilo', authenticateToken, prendaController.actualizarEstilo);

/**
 * @swagger
 * /prenda/{id}/color-secundario:
 *   patch:
 *     summary: Actualizar color secundario por nombre
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la prenda a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_color_secundario:
 *                 type: string
 *                 nullable: true
 *                 example: "#008000"
 *                 description: Hexadecimal del color o null para eliminar
 *     responses:
 *       200:
 *         description: Color secundario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_prenda:
 *                   type: integer
 *                 nombre_prenda:
 *                   type: string
 *                 nombre_categoria:
 *                   type: string
 *                 nombre_subcategoria:
 *                   type: string
 *                 estilo:
 *                   type: string
 *                 color_principal:
 *                   type: string
 *                 color_secundario:
 *                   type: string
 *                 ruta:
 *                   type: string
 *                 status:
 *                   type: boolean
 *                 favorito:
 *                   type: boolean
 *                 id_color_secundario:
 *                   type: string
 *       400:
 *         description: Color no encontrado o datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Prenda no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/color-secundario', authenticateToken, prendaController.actualizarColorSecundario);

/**
 * @swagger
 * /prenda/{id}/status:
 *   patch:
 *     summary: Actualizar estado de prenda
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la prenda a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Prenda no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/status', authenticateToken, prendaController.actualizarStatus);

/**
 * @swagger
 * /prenda/categoria/{categoria}:
 *   get:
 *     summary: Obtiene prendas por categoría
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [Superior, Inferior, Zapatos, Exterior, Monopieza]
 *         required: true
 *         description: Categoría de la prenda
 *     responses:
 *       200:
 *         description: Lista de prendas de la categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Garment'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/categoria/:categoria', authenticateToken, prendaController.getByCategory);
//este es para el de obtener prendas por categoria del usuario 

/**
 * @swagger
 * /prenda/categoria-editar-prenda-outfit:
 *   get:
 *     summary: Obtiene prendas del usuario por categoría
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [superior, inferior, zapatos, exterior, monopieza]
 *     responses:
 *       200:
 *         description: Lista de prendas filtradas
 */
router.get('/me/prendas', authenticateToken, prendaController.getUserPrendasByCategory); 
//este es para el de editar una prenda manual del outfit si no le gusto


/**
 * @swagger
 * /prenda/{id}:
 *   delete:
 *     summary: Eliminar una prenda
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la prenda a eliminar
 *     responses:
 *       200:
 *         description: Prenda eliminada correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Prenda no encontrada
 */
router.delete('/:id/delete', authenticateToken, prendaController.eliminarPrenda);



module.exports = router;
