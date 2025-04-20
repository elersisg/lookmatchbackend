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
    this.id_usuario = id_usuario;
    this.nombre_prenda = nombre_prenda;
    this.nombre_categoria = nombre_categoria;
    this.nombre_subcategoria = nombre_subcategoria;
    this.estilo = estilo;
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
