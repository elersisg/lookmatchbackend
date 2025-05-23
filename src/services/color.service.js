const ColorModel = require("../models/color.model");

class ColorService {
  /**
   * Obtiene todos los colores disponibles.
   * @returns {Promise<Array>} Lista de colores (id_color y color)
   */
  async obtenerColores() {
    try {
      return await ColorModel.obtenerColores();
    } catch (error) {
      console.error("Error en ColorService.obtenerColores:", error.message);
      throw error;
    }
  }

  /**
   * Verifica si un color existe por su ID.
   * @param {string} idColor - Código hexadecimal del color (ej: '#FFFFFF')
   * @returns {Promise<boolean>}
   */
  async existeColor(idColor) {
    try {
      return await ColorModel.existe(idColor);
    } catch (error) {
      console.error("Error en ColorService.existeColor:", error.message);
      throw error;
    }
  }

  /**
   * Busca un color por su nombre.
   * @param {string} nombreColor - Nombre del color (ej: "Negro")
   * @returns {Promise<Object|null>} Objeto con id_color o null
   */
  async buscarPorNombre(nombreColor) {
    try {
      return await ColorModel.buscarPorNombre(nombreColor);
    } catch (error) {
      console.error("Error en ColorService.buscarPorNombre:", error.message);
      throw error;
    }
  }
}

module.exports = new ColorService();
