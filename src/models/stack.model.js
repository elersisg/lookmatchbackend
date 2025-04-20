const { pool } = require('../config/dbConfig');

class Stack {
  static async create(userId, fecha_inicio, fecha_final) {
    const result = await pool.query(
      `INSERT INTO stack (id_usuario, fecha_inicio, fecha_final) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, fecha_inicio, fecha_final]
  );
  return result.rows[0];
}
//     const query = `
//         INSERT INTO stack (id_usuario, fecha_inicio, fecha_final)
//         VALUES ($1, $2, $3)
//         RETURNING *
//     `;
//     const { rows } = await pool.query(query, [userId, fecha_inicio, fecha_final]);
//     return rows[0];
// }

    static async findByUser(userId) {
      const query = `
          SELECT * FROM outfit 
          WHERE id_usuario = $1
          ORDER BY COALESCE(id_stack, 0), fecha_creacion DESC
      `;
      const { rows } = await pool.query(query, [userId]);
      return rows;
    }
}

module.exports = Stack;