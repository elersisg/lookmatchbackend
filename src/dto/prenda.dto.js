class RegistrarPrendaDTO {
  constructor({
    id_usuario,
    nombre_prenda,
    nombre_categoria,
    nombre_subcategoria,
    estilo,
    color_principal,
    color_secundario = null,
    ruta = '/uploads/default.jpg'
  }) {
    const estilosValidos = ['Semiformal', 'Casual', 'Formal', 'Deportivo', 'Moderno'];
    const estiloLimpio = estilo?.toString().trim().replace(/["']/g, '');

    if (!estilosValidos.includes(estiloLimpio)) {
      throw new Error(`Estilo inválido: "${estiloLimpio}". Debe ser uno de: ${estilosValidos.join(', ')}`);
    }

    // ⚠️ Extrae el valor hex si recibe un objeto
    const colorHex = typeof color_principal === 'object' && color_principal?.hex
      ? color_principal.hex
      : color_principal;

    const colorSecHex = typeof color_secundario === 'object' && color_secundario?.hex
      ? color_secundario.hex
      : color_secundario;

    if (!colorHex || typeof colorHex !== 'string' || !colorHex.startsWith('#')) {
      throw new Error('Color principal no válido');
    }

    this.id_usuario = id_usuario;
    this.nombre_prenda = nombre_prenda;
    this.nombre_categoria = nombre_categoria;
    this.nombre_subcategoria = nombre_subcategoria;
    this.estilo = estiloLimpio;
    this.color_principal = colorHex;
    this.color_secundario = colorSecHex || null;
    this.ruta = ruta;
  }
}



class EditarPrendaDTO {
  constructor({
    nombre_prenda = null,
    estilo = null,
    color_secundario = null,  
    status = true
  }) {
    this.nombre_prenda = nombre_prenda;
    this.estilo = estilo;
    this.color_secundario = color_secundario; 
    this.status = status;
  }
}

module.exports ={
  RegistrarPrendaDTO, 
  EditarPrendaDTO
};
