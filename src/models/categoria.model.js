const { pool } = require('../config/dbConfig.js');

class CategoriaModel {
  static async obtenerTodas() {
    const query = 'SELECT id_categoria, nombre_categoria FROM categoria_prenda'; 
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = CategoriaModel;