const Joi = require('joi');

const ColorDto = Joi.object({
  hex: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
  nombre: Joi.string().max(50).required()
});

module.exports = {
  ColorDto
};