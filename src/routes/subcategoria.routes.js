const express = require('express');
const router = express.Router();
const subcategoriaController = require('../controllers/subcategoria.controller');

/**
 * @swagger
 * tags:
 *   name: Subcategorías
 *   description: Gestión de subcategorías de prendas
 */

/**
 * @swagger
 * /subcategoria:
 *   get:
 *     summary: Obtener subcategorías por categoría
 *     tags: [Subcategorías]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la categoría para filtrar subcategorías
 *     responses:
 *       200:
 *         description: Lista de subcategorías para la categoría especificada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_subcategoria:
 *                     type: integer
 *                     example: 3
 *                   nombre_subcategoria:
 *                     type: string
 *                     example: "Camisa"
 */
router.get('/subcategorias', subcategoriaController.obtenerPorCategoria);

module.exports = router;
