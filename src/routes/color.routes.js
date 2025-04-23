const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware.js");
const router = express.Router();
const colorController = require("../controllers/color.controller");

router.use(authenticateToken);

/**
 * @swagger
 * /api/color/disponibles:
 *   get:
 *     summary: Obtiene todos los colores registrados
 *     tags: [Color]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de colores disponibles
 */
router.get("/disponibles", colorController.obtenerColores);

/**
 * @swagger
 * /api/color/existe/{idColor}:
 *   get:
 *     summary: Verifica si un color existe por su ID
 *     tags: [Color]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idColor
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del color a verificar
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 existe:
 *                   type: boolean
 *                   example: true
 */
router.get("/existe/:idColor", colorController.existeColor);

/**
 * @swagger
 * /api/color/buscar/{nombreColor}:
 *   get:
 *     summary: Busca un color por su nombre principal
 *     tags: [Color]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nombreColor
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre principal del color
 *     responses:
 *       200:
 *         description: ID del color si existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_color:
 *                   type: string
 *                   example: "CLR-BLU-02"
 *       404:
 *         description: Color no encontrado
 */
router.get("/buscar/:nombreColor", colorController.buscarPorNombre);

module.exports = router;
