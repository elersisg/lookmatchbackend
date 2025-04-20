const express = require('express');
const router = express.Router();
const OutfitController = require('../controllers/outfit.controller');
const { authenticateToken } = require('../middleware/auth.middleware.js');
router.use(authenticateToken);  // a partir de aquí, todo requiere JWT


/**
 * @swagger
 * tags:
 *   name: Outfits
 *   description: Generación de outfits aleatorios
 */

/**
 * @swagger
 * /outfits/generate:
 *   post:
 *     summary: Genera un outfit único basado en preferencias
 *     tags: [Outfits]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estilo:
 *                 type: string
 *                 enum: [Casual, Formal, Deportivo, Semiformal]
 *               colorPrincipal:
 *                 type: string
 *                 enum: [Blanco, Negro, Gris, Rojo, Naranja, Amarillo, Verde, Azul, Morado, Rosado, Marrón, Beige]
 *     responses:
 *       200:
 *         description: Outfit generado exitosamente
 */
router.post('/generate', authenticateToken, OutfitController.generateUniqueOutfit);

/**
 * @swagger
 * /outfits/{id}/favorite:
 *   patch:
 *     summary: Marcar/desmarcar outfit como favorito
 *     tags: [Outfits]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del outfit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               favorito:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado de favorito actualizado
 *       404:
 *         description: Outfit no encontrado
 */
router.patch('/:id/favorite', authenticateToken, OutfitController.toggleFavorite);

/**
 * @swagger
 * /outfits/filtered/by-day:
 *   get:
 *     summary: Obtiene outfits filtrados por día de la semana del usuario actual
 *     tags: [Outfits]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dia
 *         schema:
 *           type: string
 *           enum: [Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo]
 *         description: Día de la semana para filtrar
 *     responses:
 *       200:
 *         description: Lista de outfits filtrados por día
 *       404:
 *         description: No se encontraron outfits para el día especificado
 *       500:
 *         description: Error interno al obtener outfits filtrados por día
 */
router.get('/filtered/by-day', authenticateToken, OutfitController.getOutfitsByDay);

/**
 * @swagger
 * /outfits/filtered/by-favorite:
 *   get:
 *     summary: Obtiene outfits filtrados por favorito del usuario actual
 *     tags: [Outfits]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: favorito
 *         schema:
 *           type: boolean
 *         description: Filtrar solo favoritos (true/false)
 *     responses:
 *       200:
 *         description: Lista de outfits filtrados por favorito
 *       404:
 *         description: No se encontraron outfits marcados como favorito
 *       500:
 *         description: Error interno al obtener outfits filtrados por favorito
 */
router.get('/filtered/by-favorite', authenticateToken, OutfitController.getFavoriteOutfits);

/**
 * @swagger
 * /outfits/{outfitId}:
 *   get:
 *     summary: Obtiene los detalles completos de un outfit
 *     tags: [Outfits]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: outfitId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles completos del outfit con sus prendas
 */
router.get('/:outfitId', authenticateToken, OutfitController.getOutfitDetails);

/**
 * @swagger
 * /outfits/{outfitId}/prendas:
 *   patch:
 *     summary: Reemplaza una prenda en un outfit
 *     tags: [Outfits]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: outfitId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoria:
 *                 type: string
 *                 enum: [superior, inferior, zapatos, exterior, monopieza]
 *               nuevaPrendaId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Prenda reemplazada exitosamente
 */
router.patch('/:outfitId/prendas', authenticateToken, OutfitController.replacePrenda);

module.exports = router;
