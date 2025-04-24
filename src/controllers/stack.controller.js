const StackService = require("../services/stack.service");

class StackController {
  static async createStack(req, res, next) {
    try {
      const {
        days,
        allowRepeats = false,
        style,
        styles,
        categories = {
          superior: false,
          inferior: false,
          zapatos: true,
          exterior: false,
          monopieza: false,
        },
      } = req.body;
      const userId = req.user.id_usuario;

      if (style) {
        if (typeof style !== "string") {
          return res.status(400).json({
            error: "El estilo debe ser una cadena de texto",
            solution: 'Ejemplos válidos: "Casual", "Formal", etc.',
          });
        }

        // Verifica contra los valores permitidos
        const ESTILOS_PERMITIDOS = [
          "Casual",
          "Formal",
          "Deportivo",
          "Semiformal",
        ];
        if (!ESTILOS_PERMITIDOS.includes(style)) {
          return res.status(400).json({
            error: `Estilo no permitido: ${style}`,
            allowedStyles: ESTILOS_PERMITIDOS,
          });
        }
      }

      // Validación de días
      const numDays = parseInt(days, 10);
      if (isNaN(numDays) || numDays <= 0 || numDays > 30) {
        return res.status(400).json({ error: "Días debe ser entre 1 y 30" });
      }

      // Validación de estilos
      let processedStyle = null;
      if (style) {
        if (typeof style !== "string") {
          return res.status(400).json({
            error: "El estilo debe ser una cadena de texto",
          });
        }

        processedStyle = style.trim();
        if (processedStyle === "") {
          return res.status(400).json({
            error: "El estilo no puede estar vacío",
          });
        }
      }

      // Validación de categorías
      const {
        superior = false,
        inferior = false,
        zapatos = true,
        exterior = false,
        monopieza = false,
      } = categories;

      // Validación de combinaciones
      const hasZapatos = zapatos;
      const hasSuperiorInferior = superior && inferior;
      const hasMonopieza = monopieza;

      // Regla 1: Zapatos obligatorios
      if (!hasZapatos) {
        return res.status(400).json({
          error: "Debes seleccionar al menos zapatos",
          solution: "Los zapatos son obligatorios para generar outfits",
        });
      }

      // Regla 2: Combinaciones válidas
      const isValidCombination =
        (hasSuperiorInferior && !hasMonopieza) ||
        (hasMonopieza && !hasSuperiorInferior) ||
        (hasSuperiorInferior && hasMonopieza); // Todas seleccionadas

      if (!isValidCombination) {
        return res.status(400).json({
          error: "Combinación inválida de categorías",
          solution: "Selecciona: Superior+Inferior O Monopieza (no ambos)",
          validCombinations: [
            ["superior", "inferior", "zapatos"],
            ["monopieza", "zapatos"],
            ["superior", "inferior", "zapatos", "exterior"],
            ["monopieza", "zapatos", "exterior"],
            ["superior", "inferior", "zapatos", "exterior", "monopieza"],
          ],
          currentSelection: {
            superior,
            inferior,
            zapatos,
            exterior,
            monopieza,
          },
        });
      }

      // 1. Primero eliminamos stacks existentes
      try {
        const deletedCount = await StackService.deleteUserStacks(userId);
        console.log(`Se eliminaron ${deletedCount} stacks anteriores`);
      } catch (deleteError) {
        console.error("Error eliminando stacks anteriores:", deleteError);
        // No detenemos el proceso, solo informamos
      }

      // 2. Luego creamos el nuevo stack
      const result = await StackService.createStack(
        userId,
        numDays,
        allowRepeats,
        processedStyle,
        {
          superior,
          inferior,
          zapatos,
          exterior,
          monopieza,
        }
      );

      return res.status(201).json({
        ...result,
        message: "Nuevo stack generado (stacks anteriores fueron eliminados)",
      });
    } catch (error) {
      if (error.message.includes("No hay suficientes prendas")) {
        return res.status(400).json({
          error: error.message,
          solution: "Agrega más prendas en las categorías requeridas",
        });
      }
      console.error("Error en createStack:", error);
      res.status(500).json({
        error: "Error al crear el stack",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  static async getUserStacks(req, res) {
    try {
      const userId = req.user.id_usuario;
      console.log(`Obteniendo stacks para usuario ${userId}`);

      const stacks = await StackService.getStacksByUser(userId);

      if (!stacks.length) {
        return res.status(404).json({
          error: "No se encontraron stacks",
          solution: "Crea tu primer stack con POST /api/stacks",
        });
      }

      res.json(stacks);
    } catch (error) {
      console.error("Error en getUserStacks:", error);
      res.status(500).json({
        error: "Error interno al obtener stacks",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  static async getTodaysOutfit(req, res) {
    try {
      const outfit = await StackService.getCurrentDayOutfit(
        req.user.id_usuario
      );
      res.status(200).json({
        success: true,
        data: outfit,
      });
    } catch (error) {
      const statusCode = error.message.includes("No hay") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        solution:
          statusCode === 404
            ? "Crea un nuevo stack primero"
            : "Contacta al soporte técnico",
      });
    }
  }
}

module.exports = StackController;
