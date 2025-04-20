const { pool } = require('../config/dbConfig.js');

class SubcategoriaModel {
  static async obtenerPorCategoria(nombreCategoria) {
    const query = `
      SELECT s.id_subcategoria, s.nombre_subcategoria 
      FROM subcategoria_prenda s
      JOIN categoria_prenda c ON s.id_categoria = c.id_categoria
      WHERE c.nombre_categoria = $1
    `;
    const result = await pool.query(query, [nombreCategoria]);
    return result.rows;
  }
}

module.exports = SubcategoriaModel;