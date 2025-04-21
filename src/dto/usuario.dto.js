const Joi = require('joi');

const RegistrarUsuarioDTO = Joi.object({
  email: Joi.string().email().required(),
  contrasena: Joi.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).required(),
  telefono: Joi.string().length(10).pattern(/^[0-9]+$/).required()
});

const AuthenticateUsuarioDTO = Joi.object({
  email: Joi.string().email().required(),
  contrasena: Joi.string().min(8).required(),
});

const VerificarCodigoDTO = Joi.object({
  token_recuperacion: Joi.string().length(6).pattern(/^[0-9]+$/).required()
});

const RestablecerContrasenaDTO = Joi.object({
  token: Joi.string().required(),
  nuevaContrasena: Joi.string()
    .min(8)
    .regex(/[A-Z]/)  // Al menos 1 mayúscula
    .regex(/[0-9]/)  // Al menos 1 número
    .regex(/[!@#$%^&*(),.?":{}|<>]/)  // Al menos 1 carácter especial
    .required(),
  confirmarContrasena: Joi.string().valid(Joi.ref('nuevaContrasena')).required()
});

const ActualizarTelefonoDTO = Joi.object({
  telefono: Joi.string().pattern(/^\d{10}$/).required()
});

const VerificarContrasenaDTO = Joi.object({
  contrasena_actual: Joi.string().required()
});

const ActualizarContrasenaDTO = Joi.object({
  contrasena_nueva: Joi.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[!@#$%^&*(),.?":{}|<>]/)
    .required(),
  confirmar_contrasena: Joi.string().valid(Joi.ref('contrasena_nueva')).required()
});

const EliminarUsuarioDTO = Joi.object({
  email: Joi.string().email().required(),
  contrasena: Joi.string().min(8).required(),
});

module.exports = { RegistrarUsuarioDTO, 
  AuthenticateUsuarioDTO, 
  VerificarCodigoDTO, 
  ActualizarTelefonoDTO, 
  VerificarContrasenaDTO, 
  ActualizarContrasenaDTO, 
  EliminarUsuarioDTO, 
  RestablecerContrasenaDTO 
};
