const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller');


/**
 * @swagger
 * tags:
 *   name: Categorías
 *   description: Gestión de categorías de prendas
 */

/**
 * @swagger
 * /categoria:
 *   get:
 *     summary: Obtener todas las categorías disponibles
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Lista de categorías disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_categoria:
 *                     type: integer
 *                   nombre_categoria:
 *                     type: string
 */
router.get('/categorias', categoriaController.obtenerCategorias);

module.exports = router;
