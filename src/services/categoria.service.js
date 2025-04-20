const CategoriaModel = require('../models/categoria.model');

class CategoriaService {
  async obtenerCategorias() {
    return await CategoriaModel.obtenerTodas(); // Usa el método real del modelo
  }
}

module.exports = new CategoriaService();