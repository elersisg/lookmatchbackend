const { pool } = require('../config/dbConfig.js');
const bcrypt = require('bcrypt');
const { obtenerPerfil } = require('../controllers/usuario.controller.js');

const registrarUsuario = async (email, contrasena, telefono) => {
    try {
        const result = await pool.query(  // Usa 'pool' directamente
            'SELECT * FROM sp_registrar_usuario($1, $2, $3)',
            [email, contrasena, telefono]
        );
        // Asegúrate de que result.rows tenga datos
        if (!result.rows || result.rows.length === 0) {
            throw new Error('No se pudo registrar el usuario correctamente');
        }
        const usuario = result.rows[0];
        return usuario;
    } catch (error) {
        console.error('Error en registrarUsuario:', error.message);
        throw error;
    }
};

const restablecerContrasena = async (nuevaContrasena, tokenRecuperacion) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, salt);
        await pool.query(  // Usa 'pool' directamente
            'SELECT * FROM sp_actualizar_contrasena($1, $2)',
            [tokenRecuperacion, contrasenaEncriptada]
        );
        return 'Contraseña actualizada exitosamente';
    } catch (error) {
        console.error('Error en restablecerContrasena', error.message);
        throw error;
    }
};

const verificarCodigo = async (token_recuperacion) => {
    try {
        const result = await pool.query(
            'SELECT email FROM usuario WHERE token_recuperacion = $1 AND expiracion_token > NOW()',
            [token_recuperacion]
        );
        
        if (!result.rows.length) {
            throw new Error('Código incorrecto o expirado');
        }
        
        return result.rows[0]; // Devuelve { email: 'usuario@example.com' }
    } catch (error) {
        console.error("Error en verificarCodigo", error.message);
        throw error;
    }
};

const findUsuarioByEmail = async (email) => {
    try {
        console.log("findUsuarioByEmail: pool", pool);
        const result = await pool.query(  // Usa 'pool' directamente
            'SELECT id_usuario, email, contrasena FROM usuario WHERE email = $1', // Selecciona también la contraseña
            [email]
        );
        console.log("findUsuarioByEmail: result", result);
        return result.rows[0];
    } catch (error) {
        console.error('Error en findUsuarioByEmail:', error);
        throw new Error('Error al buscar usuario por email');
    }
};

const findUsuarioById = async (id_usuario) => {
    const result = await pool.query(
      'SELECT id_usuario, email, telefono, contrasena FROM usuario WHERE id_usuario = $1',
      [id_usuario]
    );
    return result.rows[0];
  };
  
  const actualizarTelefono = async (id_usuario, telefono) => {
    const result = await pool.query(
      'UPDATE usuario SET telefono = $1 WHERE id_usuario = $2 RETURNING id_usuario, email, telefono',
      [telefono, id_usuario]
    );
    return result.rows[0];
  };
  
  const actualizarContrasena = async (id_usuario, contrasena) => {
    const result = await pool.query(
      'UPDATE usuario SET contrasena = $1 WHERE id_usuario = $2 RETURNING id_usuario, email',
      [contrasena, id_usuario]
    );
    return result.rows[0];
  };

const guardarTokenRecuperacion = async (email, token, expiracion) => {
    try {
        await pool.query(  // Usa 'pool' directamente
            'SELECT * FROM sp_guardar_token_recuperacion($1, $2, $3)',
            [email, token, expiracion]
        );
    } catch (error) {
        console.error("Error al guardar token:", error.message);
        throw error;
    }
};

const eliminarTokenRecuperacion = async(email) => {
    try {
        await pool.query(  // Usa 'pool' directamente
            'SELECT * FROM sp_eliminar_token_recuperacion($1)',
            [email]
        );
    } catch (error) {
        console.error("Error al eliminar token:", error.message);
        throw error;
    }
};

const eliminarUsuario = async (email, contrasena) => {
    try {
        const client = await pool.connect();
        try {
            // Primero verificar que el usuario existe y la contraseña es correcta
            const usuario = await findUsuarioByEmail(email);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }

            const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena);
            if (!isPasswordValid) {
                throw new Error('Contraseña incorrecta');
            }

            // Si todo es correcto, eliminar el usuario
            const result = await client.query(
                'DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario, email',
                [usuario.id_usuario]
            );
            
            return result.rows[0];
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error en eliminarUsuario:', error.message);
        throw error;
    }
};

const obtenerperfil = await pool.query(
    'SELECT id_usuario, email, telefono FROM usuario WHERE id_usuario = $1',
    [id]
  );
  return result.rows[0];
  

module.exports = {
    registrarUsuario,
    findUsuarioByEmail,
    verificarCodigo,
    restablecerContrasena,
    findUsuarioById,
    actualizarTelefono,
    actualizarContrasena,
    guardarTokenRecuperacion,
    eliminarTokenRecuperacion,
    eliminarUsuario,
    obtenerperfil
};
