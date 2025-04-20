const { pool } = require('../config/dbConfig');

const PrendaModel = {
  async registrarPrenda(dto) {
    const query = 'SELECT * FROM sp_registrar_prenda($1, $2, $3, $4, $5, $6, $7, $8)';
    const values = [
      dto.id_usuario,
      dto.nombre_prenda,
      dto.nombre_categoria,
      dto.nombre_subcategoria,
      dto.estilo,
      dto.color_principal,
      dto.color_secundario || null,
      dto.ruta  || '/uploads/default.jpg'
    ];

    try {
      // Ejecutar el stored procedure
      const result = await pool.query(query, values);
      
      // Verificar si hubo algún mensaje de error del SP
      if (result.rows[0].sp_registrar_prenda !== 'Prenda registrada con éxito.') {
        throw new Error(result.rows[0].sp_registrar_prenda);
      }

      // Obtener la prenda recién creada
      const prendaResult = await pool.query(
        'SELECT * FROM prenda WHERE id_usuario = $1 ORDER BY id_prenda DESC LIMIT 1',
        [dto.id_usuario]
      );
      
    return prendaResult.rows[0];
    } catch (error) {
      console.error('Error en PrendaModel.registrarPrenda:', error);
      throw error;
    }
},
  
  async obtenerPrendasPorUsuario(id_usuario) {
    const query = `SELECT * FROM sp_obtener_prendas_usuario($1)`;
    const result = await pool.query(query, [id_usuario]);
    return result.rows;
  },
  
  async obtenerPrendasConFiltros(filtros, id_usuario) {
    const query = `SELECT * FROM sp_obtener_prendas_filtradas($1, $2, $3, $4, $5)`;
    const values = [
      id_usuario,
      filtros.subcategoria || null,
      filtros.color_principal || null,
      filtros.estilo || null,
      filtros.nombre_prenda || null
    ];
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error en obtenerPrendasConFiltros:', error);
      throw error;
    }
  },

  async getByCategoriesAndStyle(userId, style) {
    const query = `
        SELECT 
            p.*, 
            cp.nombre_categoria,
            c.id_color,
            c.color_principal
        FROM prenda p
        JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
        JOIN color c ON p.id_color = c.id_color
        WHERE p.id_usuario = $1 AND p.estilo = $2
        ORDER BY p.id_categoria
    `;
    const { rows } = await pool.query(query, [userId, style]);
    return rows;
},

async getByCategories(userId) {
    const query = `
        SELECT 
            p.*, 
            cp.nombre_categoria,
            c.id_color,
            c.color_principal
        FROM prenda p
        JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
        JOIN color c ON p.id_color = c.id_color
        WHERE p.id_usuario = $1
        ORDER BY p.id_categoria
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
},

async editarPrenda(id_prenda, id_usuario, datosEdicion) {
  const query = `
    UPDATE prenda SET
      nombre_prenda = COALESCE($3, nombre_prenda),
      estilo = COALESCE($4::estilo_prenda, estilo),
      id_color_secundario = COALESCE($5::character varying, id_color_secundario),   
      status = COALESCE($6, status)
    WHERE id_prenda = $1 AND id_usuario = $2
    RETURNING *`;

  const values = [
    id_prenda,
    id_usuario,
    datosEdicion.nombre_prenda,
    datosEdicion.estilo,
    datosEdicion.id_color_secundario,
    datosEdicion.status
  ];

  try {
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      throw new Error('Prenda no encontrada o no pertenece al usuario');
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error en la consulta:', { query, values, error });
    throw error;
  }
},

   async findByUser(userId) {
    const query = `
        SELECT * FROM prenda 
        WHERE id_usuario = $1 AND status = true
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
},

async getByCategory(userId, categoria) {
  const query = `
      SELECT
          p.id_prenda,
          p.nombre_prenda,
          cp.nombre_categoria,
          ps.nombre_subcategoria,
          p.estilo,
          jsonb_build_object(
              'hex', c1.id_color,
              'nombre', c1.color_principal
          ) AS color_principal,
          CASE
              WHEN c2.id_color IS NULL THEN NULL
              ELSE jsonb_build_object(
                  'hex', c2.id_color,
                  'nombre', c2.color_principal
              )
          END AS color_secundario,
          p.ruta
      FROM prenda p
      JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
      JOIN subcategoria_prenda ps ON p.id_subcategoria = ps.id_subcategoria
      JOIN color c1 ON p.id_color = c1.id_color
      LEFT JOIN color c2 ON p.id_color_secundario = c2.id_color
      WHERE p.id_usuario = $1 AND cp.nombre_categoria = $2
  `;
  const { rows } = await pool.query(query, [userId, categoria]);
  return rows;
},

  async eliminarPrenda(id_prenda, id_usuario) {
      const query = 'SELECT sp_eliminar_prenda($1, $2)';
      const values = [id_prenda, id_usuario];
      
      try {
        await pool.query(query, values);
        return { success: true };
      } catch (error) {
        console.error('Error al eliminar prenda:', error);
        throw error;
      }
    }, 
    
   async getByUserWithColors(userId) {
      const query = `
          SELECT 
              p.*,
              c.color_principal
          FROM prenda p
          LEFT JOIN color c ON p.id_color = c.id_color
          WHERE p.id_usuario = $1
      `;
      const { rows } = await pool.query(query, [userId]);
      return rows;
  }
};

module.exports = PrendaModel; 
