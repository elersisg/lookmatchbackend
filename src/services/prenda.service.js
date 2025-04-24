const PrendaModel = require("../models/prenda.model");
const { RegistrarPrendaDTO, EditarPrendaDTO } = require("../dto/prenda.dto");
const { pool } = require("../config/dbConfig"); // Necesario para consultas manuales

const PrendaService = {
  async registrarPrenda(dto) {
    const registroDTO = new RegistrarPrendaDTO(dto);
    return await PrendaModel.registrarPrenda(registroDTO);
  },

  async obtenerPrendasPorUsuario(id_usuario) {
    return await PrendaModel.obtenerPrendasPorUsuario(id_usuario);
  },

  async filtrarPrendas(filtros, id_usuario) {
    return await PrendaModel.obtenerPrendasConFiltros(filtros, id_usuario);
  },

  async actualizarCampo(id_prenda, id_usuario, campos) {
    if (
      !id_prenda ||
      !id_usuario ||
      !campos ||
      Object.keys(campos).length === 0
    ) {
      throw new Error("Datos insuficientes para actualización");
    }

    // Si se pasa `color_secundario`, convertirlo a `id_color_secundario`
    if ("color_secundario" in campos) {
      campos.id_color_secundario = campos.color_secundario || null;
      delete campos.color_secundario;
    }

    const datosEdicion = new EditarPrendaDTO({
      ...campos,
      status: campos.status !== undefined ? campos.status : true,
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
        jsonb_build_object('hex', c1.id_color, 'nombre', c1.color) AS color_principal,
        CASE
          WHEN c2.id_color IS NULL THEN NULL
          ELSE jsonb_build_object('hex', c2.id_color, 'nombre', c2.color)
        END AS color_secundario
      FROM prenda p
      JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
      LEFT JOIN subcategoria_prenda sc ON p.id_subcategoria = sc.id_subcategoria
      LEFT JOIN color c1 ON p.id_color = c1.id_color
      LEFT JOIN color c2 ON p.id_color_secundario = c2.id_color
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
