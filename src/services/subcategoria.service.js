const SubcategoriaModel = require('../models/subcategoria.model');

class SubcategoriaService {
  async obtenerPorCategoria(nombreCategoria) {
    if (!nombreCategoria) {
      throw new Error('Nombre de categoría es requerido');
    }
    return await SubcategoriaModel.obtenerPorCategoria(nombreCategoria);
  }
}

module.exports = new SubcategoriaService();