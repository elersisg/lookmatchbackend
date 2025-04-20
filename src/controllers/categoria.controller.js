const categoriaService = require('../services/categoria.service');

const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await categoriaService.obtenerCategorias(); // ← ¡Ahora existe!
    res.json({ success: true, data: categorias });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { obtenerCategorias };