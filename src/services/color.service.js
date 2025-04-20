const ColorModel = require('../models/color.model');

class ColorService {
  async obtenerColores() {
    try {
      return await ColorModel.obtenerColores();
    } catch (error) {
      console.error('Error en ColorService.obtenerColores:', error.message);
      throw error;
    }
  }
}

module.exports = new ColorService();