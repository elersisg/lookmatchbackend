const PrendaService = require("../services/prenda.service");
const fs = require("fs-extra");
const { uploadImage } = require("../middleware/cloudinary.js");

const subirImagen = async (req, res) => {
  try {
    if (!req.files?.image) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const { tempFilePath } = req.files.image;
    const result = await uploadImage(tempFilePath);
    await fs.unlink(tempFilePath);

    res.status(200).json({
      public_id: result.public_id,
      secure_url: result.secure_url,
    });
  } catch (error) {
    console.error("Error en subirImagen:", error.message);
    if (req.files?.image?.tempFilePath) {
      await fs.unlink(req.files.image.tempFilePath).catch(console.error);
    }
    res.status(500).json({
      error: "Error al subir la imagen",
      details: error.message,
    });
  }
};

const registrar = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const {
      nombre_prenda,
      nombre_categoria,
      nombre_subcategoria,
      estilo,
      color_principal, // <- id_color
      color_secundario, // <- id_color secundario
      ruta,
    } = req.body;

    if (!ruta) {
      return res
        .status(400)
        .json({ error: "La URL de la imagen es requerida." });
    }

    const nuevaPrenda = await PrendaService.registrarPrenda({
      id_usuario,
      nombre_prenda,
      nombre_categoria,
      nombre_subcategoria,
      estilo,
      color_principal,
      color_secundario,
      ruta,
    });

    res.status(201).json(nuevaPrenda);
  } catch (error) {
    console.error("Error en registrar:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const obtenerPrendasUsuario = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const prendas = await PrendaService.obtenerPrendasPorUsuario(id_usuario);
    res.status(200).json(prendas);
  } catch (error) {
    console.error("Error al obtener las prendas:", error.message);
    res.status(500).json({ error: "Error al obtener las prendas" });
  }
};

const getUserPrendasByCategory = async (req, res) => {
  try {
    const { categoria } = req.query;
    const userId = req.user.id_usuario;
    const prendas = await PrendaService.getByUserAndCategory(userId, categoria);
    res.json(prendas);
  } catch (error) {
    console.error("Error en getUserPrendasByCategory:", error);
    res.status(500).json({ error: "Error al obtener prendas" });
  }
};

const filtrarPorSubcategoria = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const subcategoria = req.params.subcategoria;
    const prendas = await PrendaService.filtrarPrendas(
      { subcategoria },
      id_usuario
    );
    res.status(200).json(prendas);
  } catch (error) {
    res.status(500).json({ error: "Error al filtrar prendas" });
  }
};

const filtrarPorColor = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const color = req.params.color;
    const prendas = await PrendaService.filtrarPrendas(
      { color_principal: color },
      id_usuario
    );
    res.status(200).json(prendas);
  } catch (error) {
    res.status(500).json({ error: "Error al filtrar prendas por color" });
  }
};

const filtrarPorEstilo = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const estilo = req.params.estilo;
    const prendas = await PrendaService.filtrarPrendas({ estilo }, id_usuario);
    res.status(200).json(prendas);
  } catch (error) {
    res.status(500).json({ error: "Error al filtrar prendas por estilo" });
  }
};

const buscarPorNombre = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const nombre = req.params.nombre;
    const prendas = await PrendaService.filtrarPrendas(
      { nombre_prenda: nombre },
      id_usuario
    );
    res.status(200).json(prendas);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar prendas por nombre" });
  }
};

const actualizarNombre = async (req, res) => {
  try {
    const resultado = await PrendaService.actualizarCampo(
      req.params.id,
      req.user.id_usuario,
      { nombre_prenda: req.body.nombre_prenda }
    );
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarEstilo = async (req, res) => {
  try {
    const resultado = await PrendaService.actualizarCampo(
      req.params.id,
      req.user.id_usuario,
      { estilo: req.body.estilo }
    );
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarColorSecundario = async (req, res) => {
  try {
    const resultado = await PrendaService.actualizarCampo(
      req.params.id,
      req.user.id_usuario,
      { color_secundario: req.body.color_secundario }
    );
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarStatus = async (req, res) => {
  try {
    if (typeof req.body.status !== "boolean") {
      throw new Error("El campo status debe ser true o false");
    }

    const resultado = await PrendaService.actualizarCampo(
      req.params.id,
      req.user.id_usuario,
      { status: req.body.status }
    );
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getByCategory = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const categoria = req.params.categoria;
    const prendas = await PrendaService.getByCategory(userId, categoria);
    res.json(prendas);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const eliminarPrenda = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const id_prenda = req.params.id;
    await PrendaService.eliminarPrenda(id_prenda, id_usuario);
    res.status(200).json({ mensaje: "Prenda eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  subirImagen,
  registrar,
  obtenerPrendasUsuario,
  getUserPrendasByCategory,
  filtrarPorSubcategoria,
  filtrarPorColor,
  filtrarPorEstilo,
  buscarPorNombre,
  actualizarNombre,
  actualizarEstilo,
  actualizarColorSecundario,
  actualizarStatus,
  getByCategory,
  eliminarPrenda,
};
