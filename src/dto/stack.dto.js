class StackDTO {
    constructor(stackData, { style = null, categoriesUsed = {} } = {}) {
        if (!stackData) throw new Error('Stack data is required');
        
        this.id = stackData.id_stack;
        this.userId = stackData.id_usuario;
        this.startDate = stackData.fecha_inicio;
        this.endDate = stackData.fecha_final;
        this.style = style;
        this.categoriesUsed = {
            superior: !!categoriesUsed.superior,
            inferior: !!categoriesUsed.inferior,
            zapatos: categoriesUsed.zapatos !== false,
            exterior: !!categoriesUsed.exterior,
            monopieza: !!categoriesUsed.monopieza
        };
    }
}

module.exports = StackDTO;