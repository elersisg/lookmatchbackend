const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware.js');
const router = express.Router();
const colorController = require('../controllers/color.controller');

// Aplica autenticación a todas las rutas de este router
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
 *         description: Lista de colores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_color:
 *                     type: string
 *                     example: "#FF0000"
 *                   color_principal:
 *                     type: string
 *                     example: "Rojo intenso"
 *                   color_secundario:
 *                     type: string
 *                     example: "Rojo oscuro"
 */
router.get('/disponibles', authenticateToken, colorController.obtenerColores);

module.exports = router;
