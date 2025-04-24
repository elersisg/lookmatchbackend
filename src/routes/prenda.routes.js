const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware.js");
const prendaController = require("../controllers/prenda.controller");

// Autenticación obligatoria en todas las rutas
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
 *         description: Lista de prendas del usuario
 */
router.get("/", prendaController.obtenerPrendasUsuario);

/**
 * @swagger
 * /prenda:
 *   post:
 *     summary: Registrar una nueva prenda
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *         description: Prenda registrada correctamente
 */
router.post("/", prendaController.registrar);

/**
 * @swagger
 * /prenda/upload:
 *   post:
 *     summary: Subir imagen de una prenda
 *     tags: [Prendas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
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
 *         description: Imagen subida exitosamente
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

// Eliminar
router.delete("/:id", prendaController.eliminarPrenda);

module.exports = router;
