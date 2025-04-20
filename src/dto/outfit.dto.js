class OutfitDTO {
    constructor({ id_outfit, id_usuario, id_stack, favorito, estilo, fecha_asignada, prendas }) {
        this.id = id_outfit;
        this.userId = id_usuario;
        this.stackId = id_stack;
        this.favorite = favorito;
        this.style = estilo;
        this.assignedDate = fecha_asignada;
        this.items = prendas ? prendas.map(p => ({
            id: p.id_prenda,
            name: p.nombre_prenda,
            category: p.id_categoria,
            subcategory: p.id_subcategoria,
            color_principal: { 
                id: p.id_color,
                nombre: p.color_principal
            },
            image: p.ruta,
            style: p.estilo
        })) : [];
    }
}

class OutfitResponseDTO {
    constructor(outfits, total, uniqueCount, maxUniquePossible, containsRepeats, requestedCount) {
        this.outfits = outfits.map(outfit => ({
            superior: outfit.items.find(p => p.id_categoria === 1), 
            inferior: outfit.items.find(p => p.id_categoria === 2),
            zapatos: outfit.items.find(p => p.id_categoria === 3),
            exterior: outfit.items.find(p => p.id_categoria === 4),
            monopieza: outfit.items.find(p => p.id_categoria === 5),
        }));
        this.total = total;
        this.uniqueCount = uniqueCount;
        this.maxUniquePossible = maxUniquePossible;
        this.containsRepeats = containsRepeats;
        this.requestedCount = requestedCount;
    }
}

module.exports = { OutfitDTO, OutfitResponseDTO };