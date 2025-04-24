const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware.js");
const prendaController = require("../controllers/prenda.controller");

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Prendas
 *   description: Gestión de prendas del usuario
 */

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
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error al obtener las prendas
 */
router.get("/", prendaController.obtenerPrendasUsuario);

/**
 * @swagger
 * /prenda:
 *   post:
 *     summary: Registrar nueva prenda
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
 *               - ruta
 *             properties:
 *               nombre_prenda:
 *                 type: string
 *               nombre_categoria:
 *                 type: string
 *               nombre_subcategoria:
 *                 type: string
 *               estilo:
 *                 type: string
 *               color_principal:
 *                 type: string
 *               color_secundario:
 *                 type: string
 *               ruta:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prenda registrada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post("/", prendaController.registrar);

/**
 * @swagger
 * /prenda/upload:
 *   post:
 *     summary: Subir imagen de prenda
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
 *     responses:
 *       200:
 *         description: Imagen subida
 *       400:
 *         description: Imagen no enviada
 *       500:
 *         description: Error al subir
 */
router.post("/upload", prendaController.subirImagen);

// Filtros
router.get(
  "/filtrar/subcategoria/:subcategoria",
  prendaController.filtrarPorSubcategoria
);
router.get("/filtrar/color/:color", prendaController.filtrarPorColor);
router.get("/filtrar/estilo/:estilo", prendaController.filtrarPorEstilo);
router.get("/buscar/:nombre", prendaController.buscarPorNombre);

// Ediciones
router.patch("/:id/nombre", prendaController.actualizarNombre);
router.patch("/:id/estilo", prendaController.actualizarEstilo);
router.patch(
  "/:id/color-secundario",
  prendaController.actualizarColorSecundario
);
router.patch("/:id/status", prendaController.actualizarStatus);

// Categorías
router.get("/categoria/:categoria", prendaController.getByCategory);
router.get("/me/prendas", prendaController.getUserPrendasByCategory);

// Eliminación
router.delete("/:id", prendaController.eliminarPrenda);

module.exports = router;
