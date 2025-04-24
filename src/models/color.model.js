const { pool } = require("../config/dbConfig");

class ColorModel {
  /**
   * Obtiene todos los colores disponibles mediante el SP.
   * @returns {Promise<Array>} Lista de colores con id_color, color_principal y color_secundario
   */
  static async obtenerColores() {
    try {
      const query = "SELECT * FROM sp_obtener_colores_disponibles()";
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error en ColorModel.obtenerColores:", error.message);
      throw error;
    }
  }

  /**
   * Verifica si un color existe por su ID.
   * @param {string} idColor - ID del color
   * @returns {Promise<boolean>} Verdadero si existe, falso si no
   */
  static async existe(idColor) {
    try {
      const query = "SELECT 1 FROM color WHERE id_color = $1";
      const result = await pool.query(query, [idColor]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error en ColorModel.existe:", error.message);
      throw error;
    }
  }

  /**
   * Busca un color por su nombre principal.
   * @param {string} nombreColor - Nombre del color principal
   * @returns {Promise<Object|null>} Objeto con id_color si lo encuentra, null si no
   */
  static async buscarPorNombre(nombreColor) {
    try {
      const query = "SELECT id_color FROM color WHERE color_principal = $1";
      const result = await pool.query(query, [nombreColor]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error en ColorModel.buscarPorNombre:", error.message);
      throw error;
    }
  }
}

module.exports = ColorModel;
