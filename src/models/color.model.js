const { pool } = require('../config/dbConfig');

class ColorModel {
  static async obtenerColores() {
    try {
      const query = 'SELECT * FROM sp_obtener_colores_disponibles()';
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error en ColorModel.obtenerColores:', error.message);
      throw error;
    }
  }

  static async existe(idColor) {
    const query = 'SELECT 1 FROM color WHERE id_color = $1';
    const result = await pool.query(query, [idColor]);
    return result.rowCount > 0;
  }

  static async buscarPorNombre(nombreColor) {
    const query = 'SELECT id_color FROM color WHERE color_principal = $1';
    const result = await pool.query(query, [nombreColor]);
    return result.rows[0] || null;
  }
}

module.exports = ColorModel;