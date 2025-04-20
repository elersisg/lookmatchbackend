const colorService = require('../services/color.service');

const obtenerColores = async (req, res) => {
  try {
    const colores = await colorService.obtenerColores();
    res.json({
      success: true,
      data: colores
    });
  } catch (error) {
    console.error('Error en obtenerColores:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener colores: ' + error.message
    });
  }
};

module.exports = {
  obtenerColores
};