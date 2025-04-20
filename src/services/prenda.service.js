const PrendaModel = require('../models/prenda.model');
const { RegistrarPrendaDTO, EditarPrendaDTO } = require('../dto/prenda.dto');

const PrendaService = {
  async registrarPrenda(dto) {
      const registroDTO = new RegistrarPrendaDTO(dto); // Usa el DTO directamente
      return await PrendaModel.registrarPrenda(registroDTO);
    },

  async obtenerPrendasPorUsuario(id_usuario) {
    return await PrendaModel.obtenerPrendasPorUsuario(id_usuario);
  },
  
  async filtrarPrendas(filtros, id_usuario) {
    return await PrendaModel.obtenerPrendasConFiltros(filtros, id_usuario);
  },

  async actualizarCampo(id_prenda, id_usuario, campos) {
    if (!id_prenda || !id_usuario || !campos || Object.keys(campos).length === 0) {
      throw new Error('Datos insuficientes para actualización');
    }
  
    // Procesamiento especial para color_secundario
    if (campos.color_secundario !== undefined) {
      campos.id_color_secundario = campos.color_secundario || null; 
      delete campos.color_secundario;
    }
  
    const datosEdicion = new EditarPrendaDTO({
      ...campos,
      status: campos.status !== undefined ? campos.status : true
    });
  
    return await PrendaModel.editarPrenda(id_prenda, id_usuario, datosEdicion);
  },
  
   async getByUserAndCategory(userId, categoria) {
    const query = `
        SELECT 
            p.id_prenda,
            p.nombre_prenda,
            p.estilo,
            p.ruta,
            cp.nombre_categoria,
            sc.nombre_subcategoria,
            c.color_principal
        FROM prenda p
        JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
        LEFT JOIN subcategoria_prenda sc ON p.id_subcategoria = sc.id_subcategoria
        LEFT JOIN color c ON p.id_color = c.id_color
        WHERE p.id_usuario = $1 AND cp.nombre_categoria = $2
        ORDER BY p.nombre_prenda
    `;
    
    const { rows } = await pool.query(query, [userId, categoria]);
    return rows;
},

   async getByCategory(userId, category) {
    return await PrendaModel.getByCategory(userId, category);
},

  async eliminarPrenda(id_prenda, id_usuario) {
    return await PrendaModel.eliminarPrenda(id_prenda, id_usuario);
  },
  
};

module.exports = PrendaService;
