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

// Obtener todas las prendas del usuario
router.get("/", prendaController.obtenerPrendasUsuario);

// Registrar nueva prenda
router.post("/", prendaController.registrar);

// Subir imagen
router.post("/upload", prendaController.subirImagen);

// Filtros
router.get(
  "/filtrar/subcategoria/:subcategoria",
  prendaController.filtrarPorSubcategoria
);
router.get("/filtrar/color/:color", prendaController.filtrarPorColor);
router.get("/filtrar/estilo/:estilo", prendaController.filtrarPorEstilo);
router.get("/buscar/:nombre", prendaController.buscarPorNombre);

// Ediciones de prenda
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

// Eliminar prenda
router.delete("/:id", prendaController.eliminarPrenda);

module.exports = router;
