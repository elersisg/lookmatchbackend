const usuarioModel = require('../models/usuario.model');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Crear usuario
const registrarUsuario = async (data) => {
    const { email, contrasena, telefono } = data;

    // Verificar si el usuario ya existe
    const usuarioExistente = await findUsuarioByEmail(email);
    if (usuarioExistente) throw new Error('El correo ya está registrado');

    return await usuarioModel.registrarUsuario(email, contrasena, telefono);
};

//  Buscar usuario por email
const findUsuarioByEmail = async (email) => {
    return await usuarioModel.findUsuarioByEmail(email);
};

const authenticateUsuario = async (email, contrasena) => {
    console.log(`Intentando autenticar el correo: ${email}`);

    const usuario = await findUsuarioByEmail(email);
    if (!usuario) {
        console.log(`Usuario no encontrado para el correo: ${email}`);
        throw new Error('Usuario no encontrado');
    }

    console.log(`Usuario encontrado: ${usuario.email} ${usuario.contrasena ? 'Contraseña hasheada presente' : 'Contraseña no presente'}`);
    console.log("authenticateUsuario - Contraseña recibida (sin modificar):", contrasena);

    // *** AGREGAR ESTOS LOGS ***
    console.log("authenticateUsuario - Contraseña a comparar (antes de bcrypt):", contrasena);
    console.log("authenticateUsuario - Hash de la BD a comparar (antes de bcrypt):", usuario.contrasena);
    // *** FIN DE LOS LOGS AGREGADOS ***

    const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena);
    console.log("authenticateUsuario - bcrypt.compare resultado:", isPasswordValid);

    if (!isPasswordValid) {
        console.log(`Contraseña inválida para el correo: ${email}`);
        throw new Error('Credenciales inválidas');
    }

    console.log(`Autenticación exitosa para el correo: ${email}`);
    return { usuario };
};

const transporter = nodemailer.createTransport({
    host: process.env.GMAIL_HOST,
    port: process.env.GMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

//Generar código y enviarlo por email
const solicitarCodigo = async (email) => {
    const usuario = await findUsuarioByEmail(email);
    if (!usuario) throw new Error('Usuario no encontrado');

    const token_recuperacion = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion_token = new Date(Date.now() + 3600000); // 1 hora

    await usuarioModel.guardarTokenRecuperacion(email, token_recuperacion, expiracion_token);


    await transporter.sendMail({
        from: '"Soporte" <no-reply@voxnet.com>',
        to: email,
        subject: "Código de recuperación",
        html: `<p>Tu código de verificación es: <strong>${token_recuperacion}</strong></p>
                <p>Si no solicitaste esto, ignora este correo.</p>`
    });

    return 'Código enviado';
};

const verificarCodigo = async (token_recuperacion) => {
    const result = await usuarioModel.verificarCodigo(token_recuperacion);
    
    if (!result || !result.email) {
        throw new Error('Código incorrecto o expirado');
    }
    
    return result; // Devuelve el objeto con el email
};

const guardartokenRecuperacion = async (email, token_recuperacion, expiracion_token) => {
     await usuarioModel.guardarTokenRecuperacion(email, token_recuperacion, expiracion_token);
     return "Token guardado";
};

const restablecerContrasena = async (contrasenaEncriptada, token) => {
    try {
        // Verificar que el token aún sea válido
        const usuario = await usuarioModel.verificarCodigo(token);
        if (!usuario) throw new Error('Token expirado o inválido');

        // Actualizar contraseña
        await usuarioModel.restablecerContrasena(contrasenaEncriptada, token);
        
        // Eliminar token usado
        await usuarioModel.eliminarTokenRecuperacion(usuario.email);
        
        return 'Contraseña actualizada';
    } catch (error) {
        console.error('Error en restablecerContrasena:', error);
        throw error;
    }
};

const actualizarTelefono = async (id_usuario, telefono) => {
    if (!/^\d{10}$/.test(telefono)) {
      throw new Error('El teléfono debe tener exactamente 10 dígitos');
    }
    return await usuarioModel.actualizarTelefono(id_usuario, telefono);
  };
  
  const verificarContrasena = async (id_usuario, contrasena_actual) => {
    const usuario = await usuarioModel.findUsuarioById(id_usuario);
    if (!usuario) throw new Error('Usuario no encontrado');
    
    return await bcrypt.compare(contrasena_actual, usuario.contrasena);
  };
  
  const actualizarContrasena = async (id_usuario, contrasena_nueva, confirmar_contrasena) => {
    if (contrasena_nueva !== confirmar_contrasena) {
      throw new Error('Las contraseñas no coinciden');
    }
  
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena_nueva, salt);
    return await usuarioModel.actualizarContrasena(id_usuario, hash);
  };

  const eliminarUsuario = async (email, contrasena) => {
    try {
        // Verificar que el usuario existe
        const usuario = await findUsuarioByEmail(email);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!isPasswordValid) {
            throw new Error('Contraseña incorrecta');
        }

        // Eliminar el usuario
        return await usuarioModel.eliminarUsuario(email, contrasena);
    } catch (error) {
        console.error('Error en eliminarUsuario:', error.message);
        throw error;
    }
};

async function findUsuarioById(id_usuario) {
    const usuario = await usuarioModel.findUsuarioById(id_usuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  }

module.exports = {
    registrarUsuario,
    authenticateUsuario,
    solicitarCodigo,
    verificarCodigo,
    findUsuarioByEmail,
    guardartokenRecuperacion,
    restablecerContrasena,
    actualizarTelefono,
    verificarContrasena,
    actualizarContrasena,
    eliminarUsuario,
    findUsuarioById
};
