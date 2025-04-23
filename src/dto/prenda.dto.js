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
      if (!estilosValidos.includes(estilo)) {
      throw new Error(`Estilo inválido. Debe ser uno de: ${estilosValidos.join(', ')}`);
    }
    // Asegúrate de que coincidan con el enum
    const estiloLimpio = estilo?.toString().trim().replace(/["']/g, ''); // elimina comillas

    if (!estilosValidos.includes(estiloLimpio)) {
      throw new Error(`Estilo inválido: "${estiloLimpio}". Debe ser uno de: ${estilosValidos.join(', ')}`);
    }

    this.id_usuario = id_usuario;
    this.nombre_prenda = nombre_prenda;
    this.nombre_categoria = nombre_categoria;
    this.nombre_subcategoria = nombre_subcategoria;
    this.estilo = estiloLimpio;
    this.color_principal = color_principal;
    this.color_secundario = color_secundario;
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
