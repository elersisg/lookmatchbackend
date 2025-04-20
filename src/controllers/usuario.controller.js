const jwt = require('jsonwebtoken');
const usuarioService = require('../services/usuario.service.js'); //  Ajusta la ruta para que sea relativa y correcta
const { RegistrarUsuarioDTO, AuthenticateUsuarioDTO, ActualizarTelefonoDTO, VerificarContrasenaDTO, ActualizarContrasenaDTO, EliminarUsuarioDTO} = require('../dto/usuario.dto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Función para validar la contraseña
const validarContrasena = (contrasena) => {
    const errores = [];
    
    if (contrasena.length < 8) errores.push('Debe tener al menos 8 caracteres');
    if (!/[A-Z]/.test(contrasena)) errores.push('Debe contener al menos 1 mayúscula');
    if (!/[0-9]/.test(contrasena)) errores.push('Debe contener al menos 1 número');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(contrasena)) {
        errores.push('Debe contener al menos 1 carácter especial');
    }

    if (errores.length > 0) {
        throw new Error(errores.join(', '));
    }
};

//Función para registrar un nuevo usuario
const registrarUsuario = async (req, res, next) => {
    try {
        // Validación de datos de entrada usando DTO
        const validatedData = await RegistrarUsuarioDTO.validateAsync(req.body);

        // Validar la contraseña
        validarContrasena(validatedData.contrasena);

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(validatedData.contrasena, salt);

        // Verificar que el teléfono tenga exactamente 10 dígitos
        if (validatedData.telefono.length !== 10 || !/^\d+$/.test(validatedData.telefono)) {
            throw new Error('El teléfono debe tener exactamente 10 números');
        }

        // Registrar el usuario usando el servicio
        const usuario = await usuarioService.registrarUsuario({  // Llama a la función del servicio
            email: validatedData.email,
            contrasena: contrasenaEncriptada, // Usar la contraseña encriptada
            telefono: validatedData.telefono,
        });

        // Responder con el usuario registrado (sin token)
        res.status(201).json({ message: 'Usuario registrado exitosamente', usuario });

    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        if (error.isJoi) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next(error);
    }
};

const autenticarUsuario = async (req, res, next) => {
    try {
        // Validación de datos de entrada usando DTO
        const validatedData = await AuthenticateUsuarioDTO.validateAsync(req.body);
        console.log("autenticarUsuario - Contraseña recibida del cliente:", validatedData.contrasena);

        // Autenticar al usuario usando el servicio
        const { usuario } = await usuarioService.authenticateUsuario(validatedData.email, validatedData.contrasena);

        // Generar el token JWT
        const token = jwt.sign(
            { id_usuario: usuario.id_usuario,
            email: usuario.email
        },  process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        // Retornar el mensaje de éxito y los datos del usuario
        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                email: usuario.email,
            },
        });
    } catch (error) {
        // Mejor manejo de errores para proporcionar mensajes claros al cliente
        if (error.message === 'Usuario no encontrado' || error.message === 'Credenciales inválidas') {
            return res.status(401).json({ error: error.message });
        }
        next(error);
    }
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



const solicitarCodigo = async (req, res, next) => {
    try {
        const { email } = req.body;
        const usuario = await usuarioService.findUsuarioByEmail(email);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const token_recuperacion = Math.floor(100000 + Math.random() * 900000).toString(); // Asegurar que es string

       const result = await usuarioService.guardartokenRecuperacion(email, token_recuperacion, new Date(Date.now() + 3600000));  // Llama a la función del servicio


        await transporter.sendMail({
            from: '"Soporte" <no-reply@voxnet.com>',
            to: email,
            subject: "Código de recuperación",
            html: `<p>Tu código de verificación es: <strong>${token_recuperacion}</strong></p><p>Si no solicitaste esto, ignora este correo.</p>`
        });

        res.json({ message: 'Código enviado' });
    } catch (error) {
        next(error);
    }
};

const verificarCodigo = async (req, res, next) => {
    try {
        const { token_recuperacion } = req.body;
        const result = await usuarioService.verificarCodigo(token_recuperacion);

        // Guardar token en sesión
        req.session.token_recuperacion = token_recuperacion;
        req.session.email = result.email;
        
        res.json({ message: 'Código verificado' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const restablecerContrasena = async (req, res, next) => {
    try {
        const { nuevaContrasena, confirmarContrasena } = req.body;
        const { token_recuperacion } = req.session; // Obtenemos el token de la sesión

        if (!token_recuperacion) {
            return res.status(400).json({ error: 'Sesión inválida. Verifica el código primero.' });
        }

        // Validaciones de contraseña (igual que en registro)
        validarContrasena(nuevaContrasena);
        
        if (nuevaContrasena !== confirmarContrasena) {
            throw new Error('Las contraseñas no coinciden');
        }

        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, salt);

        // Restablecer usando el token de sesión
        await usuarioService.restablecerContrasena(contrasenaEncriptada, token_recuperacion);

        // Limpiar la sesión
        req.session.destroy();
        
        res.json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
        console.error('Error en restablecerContrasena:', error);
        res.status(400).json({ error: error.message });
    }
};

const actualizarTelefono = async (req, res) => {
    try {
      const { telefono } = await ActualizarTelefonoDTO.validateAsync(req.body);
      const usuario = await usuarioService.actualizarTelefono(
        req.user.id_usuario,
        telefono
      );
      res.status(200).json({
        message: 'Teléfono actualizado correctamente',
        usuario
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  const verificarContrasena = async (req, res) => {
    try {
      const { contrasena_actual } = await VerificarContrasenaDTO.validateAsync(req.body);
      const esValida = await usuarioService.verificarContrasena(
        req.user.id_usuario,
        contrasena_actual
      );
      
      if (!esValida) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' });
      }
      
      res.status(200).json({ message: 'Contraseña verificada correctamente' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  const actualizarContrasena = async (req, res) => {
    try {
      const { contrasena_nueva, confirmar_contrasena } = await ActualizarContrasenaDTO.validateAsync(req.body);
      const usuario = await usuarioService.actualizarContrasena(
        req.user.id_usuario,
        contrasena_nueva,
        confirmar_contrasena
      );
      res.status(200).json({
        message: 'Contraseña actualizada correctamente',
        usuario
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const eliminarUsuario = async (req, res) => {
    try {
        // Verificar primero que req.user existe
        if (!req.user || !req.user.email) {
            return res.status(401).json({ error: 'No autenticado o token inválido' });
        }

        const validatedData = await EliminarUsuarioDTO.validateAsync(req.body);
        
        // Normalizar emails
        const emailToken = req.user.email?.trim()?.toLowerCase();
        const emailBody = validatedData.email?.trim()?.toLowerCase();

        if (!emailToken || !emailBody) {
            return res.status(400).json({ error: 'Datos de correo electrónico no válidos' });
        }

        if (emailToken !== emailBody) {
            return res.status(403).json({ 
                error: 'No puedes eliminar esta cuenta: el correo no coincide con tu sesión.' 
            });
        }

        const resultado = await usuarioService.eliminarUsuario(
            validatedData.email,
            validatedData.contrasena
        );

        res.status(200).json({ 
            message: 'Cuenta eliminada exitosamente',
            usuario: resultado 
        });
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ error: error.details[0].message });
        }
        res.status(400).json({ error: error.message });
    }
};

const obtenerPerfil = async (req, res, next) => {
    try {
      const id = req.user.id_usuario;
  
      const usuario = await usuarioService.findUsuarioById(id);
  
      // 3) Si no existe, devolvemos 404
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      // 4) Respondemos solo con los campos públicos
      res.json({
        id_usuario: usuario.id_usuario,
        email:      usuario.email,
        telefono:   usuario.telefono
      });
    } catch (err) {
      next(err);
    }
  };

module.exports = {
    registrarUsuario,
    autenticarUsuario,
    solicitarCodigo,
    verificarCodigo,
    restablecerContrasena,
    actualizarTelefono,
    verificarContrasena,
    actualizarContrasena,
    eliminarUsuario,
    obtenerPerfil
};
