require('dotenv').config(); // Añade esto en la PRIMERA línea
const cloudinary = require('cloudinary').v2;

// Configuración directa desde process.env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Función optimizada para subir imágenes
const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'LookMatchimagenes',
      resource_type: 'auto', // Detecta automáticamente imágenes/videos
      quality_analysis: true // Opcional: análisis de calidad
    });
    return result;
  } catch (error) {
    console.error('Error en Cloudinary:', error);
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
};

module.exports = { uploadImage };

async function deleteImage(public_id) {
  return await cloudinary.uploader.destroy(public_id);
}

// Exporta las funciones con module.exports
module.exports = { 
  uploadImage, 
  deleteImage 
};