const colorService = require("../services/color.service");

/**
 * Obtiene todos los colores disponibles.
 */
const obtenerColores = async (req, res) => {
  try {
    const colores = await colorService.obtenerColores();
    res.json({
      success: true,
      data: colores,
    });
  } catch (error) {
    console.error("Error en obtenerColores:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener colores: " + error.message,
    });
  }
};

/**
 * Verifica si un color existe por su ID.
 */
const existeColor = async (req, res) => {
  try {
    const { idColor } = req.params;
    const existe = await colorService.existeColor(idColor);
    res.json({
      success: true,
      data: { existe },
    });
  } catch (error) {
    console.error("Error en existeColor:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al verificar existencia del color: " + error.message,
    });
  }
};

/**
 * Busca un color por su nombre principal.
 */
const buscarPorNombre = async (req, res) => {
  try {
    const { nombreColor } = req.params;
    const resultado = await colorService.buscarPorNombre(nombreColor);
    if (resultado) {
      res.json({
        success: true,
        data: resultado,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Color no encontrado",
      });
    }
  } catch (error) {
    console.error("Error en buscarPorNombre:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al buscar el color: " + error.message,
    });
  }
};

module.exports = {
  obtenerColores,
  existeColor,
  buscarPorNombre,
};
