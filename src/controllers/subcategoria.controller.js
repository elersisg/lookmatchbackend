const SubcategoriaModel = require('../models/subcategoria.model');

const obtenerPorCategoria = async (req, res) => {
  try {
    const { categoria } = req.query;
    if (!categoria) {
      return res.status(400).json({ success: false, message: 'Parámetro "categoria" requerido' });
    }

    const subcategorias = await SubcategoriaModel.obtenerPorCategoria(categoria);
    res.json({ success: true, data: subcategorias });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  obtenerPorCategoria,
};