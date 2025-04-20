const express = require('express');
const router = express.Router();
const StackController = require('../controllers/stack.controller');
const { authenticateToken } = require('../middleware/auth.middleware.js');
router.use(authenticateToken);  // a partir de aquí, todo requiere JWT

/**
 * @swagger
 * tags:
 *   name: Stacks
 *   description: Manejo de stacks de outfits
 */


/**
 * @swagger
 * /stacks:
 *   post:
 *     summary: Crea un nuevo stack de outfits (1 solo estilo permitido)
 *     description: |
 *       Genera un conjunto de outfits para varios días.
 *     tags: [Stacks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - days
 *             properties:
 *               days:
 *                 type: integer
 *                 description: Número de días a generar (1-30)
 *                 minimum: 1
 *                 maximum: 30
 *                 example: 3
 *               allowRepeats:
 *                 type: boolean
 *                 description: Permitir repetición de prendas
 *                 default: false
 *                 example: false
 *               style:
 *                 type: string
 *                 description: |
 *                   Estilo único para los outfits.
 *                   Opciones: Semiformal, Casual, Formal, Deportivo
 *                 enum: [Semiformal, Casual, Formal, Deportivo]
 *                 example: "Casual"
 *               categories:
 *                 type: object
 *                 description: Categorías de prendas a incluir
 *                 properties:
 *                   superior:
 *                     type: boolean
 *                     default: false
 *                   inferior:
 *                     type: boolean
 *                     default: false
 *                   zapatos:
 *                     type: boolean
 *                     default: true
 *                   exterior:
 *                     type: boolean
 *                     default: false
 *                   monopieza:
 *                     type: boolean
 *                     default: false
 *                 example:
 *                   superior: true
 *                   inferior: true
 *                   zapatos: true
 *                   exterior: false
 *                   monopieza: false
 *     responses:
 *       201:
 *         description: Stack creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stack:
 *                   $ref: '#/components/schemas/Stack'
 *                 outfits:
 *                   $ref: '#/components/schemas/OutfitsResponse'
 *       400:
 *         description: |
 *           Error en la solicitud. Posibles causas:
 *           - No hay prendas disponibles para el estilo solicitado
 *           - Combinación inválida de categorías
*         content:
 *           application/json:
 *             examples:
 *               noPrendas:
 *                 summary: No hay prendas disponibles
 *                 value:
 *                   error: "No se encontraron prendas Casual en las categorías seleccionadas"
 *                   solution: "Agrega prendas con el estilo y categorías requeridas"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al crear el stack"
 *               solution: "Por favor intente nuevamente"
 *
 * components:
 *   schemas:
 *     Stack:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         style:
 *           type: string
 *           nullable: true
 *         categoriesUsed:
 *           $ref: '#/components/schemas/CategoriesUsed'
 *     OutfitsResponse:
 *       type: object
 *       properties:
 *         outfits:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Outfit'
 *         total:
 *           type: integer
 *         uniqueCount:
 *           type: integer
 *         maxUniquePossible:
 *           type: integer
 *         containsRepeats:
 *           type: boolean
 *     Outfit:
 *       type: object
 *       properties:
 *         id_outfit:
 *           type: integer
 *         estilo:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClothingItem'
 *     ClothingItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre_prenda:
 *           type: string
 *         nombre_categoria:
 *           type: string
 *         nombre_subcategoria:
 *           type: string
 *         estilo:
 *           type: string
 *         ruta:
 *           type: string
 *     CategoriesUsed:
 *       type: object
 *       properties:
 *         superior:
 *           type: boolean
 *         inferior:
 *           type: boolean
 *         zapatos:
 *           type: boolean
 *         exterior:
 *           type: boolean
 *         monopieza:
 *           type: boolean
 */
router.post('/crear-stack', authenticateToken, StackController.createStack);

/**
 * @swagger
 * /stacks/current:
 *   get:
 *     summary: Obtiene todos los stacks y outfits del usuario actual
 *     tags: [Stacks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de stacks con outfits anidados
 *         content:
 *           application/json:
 *             example:
 *               - id: 77
 *                 userId: 12
 *                 startDate: "2025-04-15T00:00:00Z"
 *                 endDate: "2025-04-17T00:00:00Z"
 *                 outfits:
 *                   outfit_83:
 *                     items:
 *                       - id: 24
 *                         name: "Camiseta"
 *                         category: "Superior"
 *                         image: "https://res.cloudinary.com/..."
 *                   outfit_84:
 *                     items:
 *                       - id: 25
 *                         name: "Vestido"
 *                         category: "Monopieza"
 *                         image: "https://res.cloudinary.com/..."
 *       404:
 *         description: No se encontraron stacks
 */
router.get('/current', authenticateToken, StackController.getUserStacks);


/**
 * @swagger
 * /stacks/today-outfit:
 *   get:
 *     summary: Obtiene el outfit asignado para el día actual
 *     tags: [Stacks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Outfit del día actual obtenido exitosamente
 *       401:
 *         description: No autorizado (token inválido o no proporcionado)
 *       404:
 *         description: No se encontró stack activo u outfit para hoy
 *       500:
 *         description: Error interno del servidor
 */
router.get('/today-outfit', authenticateToken, StackController.getTodaysOutfit);


module.exports = router;