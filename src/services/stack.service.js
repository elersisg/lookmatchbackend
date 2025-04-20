const Stack = require('../models/stack.model');
const OutfitService = require('./outfit.service');
const StackDTO = require('../dto/stack.dto');
const PrendaModel = require('../models/prenda.model');
const { pool } = require('../config/dbConfig');
const Outfit = require('../models/outfit.model'); 

const DAYS_TRANSLATION = {
    'monday': 'Lunes',
    'tuesday': 'Martes',
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado',
    'sunday': 'Domingo'
};

class StackService {
    static async createStack(userId, days, allowRepeats = false, style = null, selectedCategories = {}) {

        // Validación básica de entrada
        if (!userId || !days) {
            throw new Error('Parámetros requeridos faltantes');
        }

        if (style && typeof style !== 'string') {
            throw new Error('El parámetro style debe ser una cadena de texto');
        }

        // Validación de categorías seleccionadas
        if (!selectedCategories || typeof selectedCategories !== 'object') {
            throw new Error('Las categorías seleccionadas son inválidas');
        }

        // Establecer valores por defecto
        const categories = {
            superior: !!selectedCategories.superior,
            inferior: !!selectedCategories.inferior,
            zapatos: selectedCategories.zapatos !== false,
            exterior: !!selectedCategories.exterior,
            monopieza: !!selectedCategories.monopieza
        };

        try {
            // 1. Eliminar stacks existentes
            await this.deleteUserStacks(userId);

           // 2. Crear nuevo stack
           const fecha_inicio = new Date();
           const fecha_final = new Date();
           fecha_final.setDate(fecha_inicio.getDate() + days - 1);

           const stack = await Stack.create(
               userId, 
               fecha_inicio.toISOString(),
               fecha_final.toISOString(),
               style
           );

            // 3. Obtener prendas (con un solo estilo o todas)
            const prendas = style 
            ? await PrendaModel.getByCategoriesAndStyle(userId, style)
            : await PrendaModel.getByCategories(userId);
          

        if (!prendas || prendas.length === 0) {
            const errorMessage = style
                ? `No se encontraron prendas ${style} en las categorías seleccionadas`
                : 'No se encontraron prendas en las categorías seleccionadas';
            
            throw {
                message: errorMessage,
                statusCode: 400,
                details: {
                    userId,
                    style,
                    categories: selectedCategories
                }
            };
        }
            // 4. Generar outfits
            let outfitResult;
            try {
                outfitResult = await OutfitService.generateAndGetOutfits(
                    userId, 
                    stack.id_stack, 
                    days, 
                    allowRepeats,
                    style, 
                    categories,
                    fecha_inicio.toISOString() // Pasar fecha de inicio
                );
            } catch (outfitError) {
                console.error('Error en generación de outfits:', outfitError);
                throw new Error(`Error al generar outfits: ${outfitError.message}`);
            }

            // Validar resultado
            if (!outfitResult || outfitResult.success === false) {
                const errorMsg = outfitResult?.error || 'Error desconocido al generar outfits';
                throw new Error(errorMsg);
            }

            if (!outfitResult.data?.outfits) {
                throw new Error('Estructura de datos de outfits inválida');
            }

            console.log('Stack creado con estilo:', style || 'Ninguno especificado');

            return {
                stack: new StackDTO(stack, {
                    style,
                    categoriesUsed: categories
                }),
                outfits: {
                        outfits: outfitResult.data.outfits.map(outfit => ({
                            id_outfit: outfit.id_outfit,
                            dia: DAYS_TRANSLATION[outfit.dia.toLowerCase()] || outfit.dia,                            fecha_asignada: outfit.fecha_asignada,
                            estilo: outfit.estilo,
                            favorito: outfit.favorito || false,
                        items: outfit.items.map(item => ({
                            id_prenda: item.id_prenda,
                            nombre_prenda: item.nombre_prenda,
                            nombre_categoria: item.nombre_categoria,
                            nombre_subcategoria: item.nombre_subcategoria,
                            estilo: item.estilo,
                            id_color: item.id_color,          
                            color_principal: item.color_principal, 
                            ruta: item.ruta
                        }))
                    })),
                    total: outfitResult.data.total,
                    uniqueCount: outfitResult.data.uniqueCount,
                    maxUniquePossible: outfitResult.data.maxUniquePossible,
                    containsRepeats: outfitResult.data.containsRepeats,
                    requestedCount: outfitResult.data.requestedCount,
                    usedCategories: outfitResult.data.usedCategories
                }
            };

        } catch (error) {
            console.error('Error en createStack:', {
                error: error.message,
                userId,
                days,
                style,
                selectedCategories
            });
            
          if (error.statusCode) {
            error.solution = 'Agrega prendas con el estilo y categorías requeridas';
            throw error;
        }
        
        // Manejo para otros errores
        if (error.message.includes('No hay suficientes prendas')) {
            error.solution = 'Agrega más prendas en las categorías requeridas';
            error.statusCode = 400;
        }
        
        throw error;
        }
    }

    static async deleteUserStacks(userId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 1. Eliminar relaciones en outfit_prenda
            await client.query(`
                DELETE FROM outfit_prenda 
                WHERE id_outfit IN (
                    SELECT id_outfit FROM outfit 
                    WHERE id_stack IN (
                        SELECT id_stack FROM stack WHERE id_usuario = $1
                    )
                    AND id_stack IS NOT NULL  
                )`, 
                [userId]
            );
            
            // 2. Eliminar outfits
            await client.query(`
                DELETE FROM outfit 
                WHERE id_stack IN (
                    SELECT id_stack FROM stack WHERE id_usuario = $1
                )`, 
                [userId]
            );
            
            // 3. Eliminar stacks
            const result = await client.query(
                'DELETE FROM stack WHERE id_usuario = $1 RETURNING *',
                [userId]
            );
            
            await client.query('COMMIT');
            return result.rowCount;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error en deleteUserStacks:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async getStacksByUser(userId) {
        try {
            // 1. Obtener todos los stacks del usuario
            const stacksQuery = `
                SELECT * FROM stack 
                WHERE id_usuario = $1 
                ORDER BY fecha_inicio DESC
            `;
            const { rows: stacks } = await pool.query(stacksQuery, [userId]);

            if (!stacks || stacks.length === 0) {
                return [];
            }
    
            return await Promise.all(stacks.map(async stack => {
                try {
                    const outfits = await Outfit.findByStack(stack.id_stack);
                    
                    if (!outfits || outfits.length === 0) {
                        return {
                            ...stack,
                            outfits: []
                        };
                    }
                    
                    return {
                        id: stack.id_stack,
                        userId: stack.id_usuario,
                        startDate: stack.fecha_inicio,
                        endDate: stack.fecha_final,
                        outfits: outfits.reduce((acc, outfit) => {
                            const rawDay = outfit.dia_semana?.toLowerCase() || 'no asignado';
                            const translatedDay = DAYS_TRANSLATION[rawDay] || rawDay;
                            acc[`outfit_${outfit.id_outfit}`] = {
                                dia: translatedDay,
                                assignedDate: outfit.fecha_asignada,
                                style: outfit.estilo || 'No especificado',
                                items: outfit.items.map(item => ({
                                    id_prenda: item.id_prenda,
                                    nombre_prenda: item.nombre_prenda,
                                    estilo: item.estilo,
                                    nombre_categoria: item.nombre_categoria,
                                    nombre_subcategoria: item.nombre_subcategoria,
                                    color: {
                                        id: item.id_color,
                                        color_principal: item.color_principal
                                    },
                                    ruta: item.ruta,
                                }))
                            };
                            return acc;
                        }, {})
                    };
                } catch (error) {
                    console.error(`Error procesando stack ${stack.id_stack}:`, error);
                    return {
                        id: stack.id_stack,
                        userId: stack.id_usuario,
                        startDate: stack.fecha_inicio,
                        endDate: stack.fecha_final,
                        error: 'Error al cargar outfits',
                        details: process.env.NODE_ENV === 'development' ? error.message : undefined
                    };
                }
            }));
        } catch (error) {
            console.error('Error en getStacksByUser:', error);
            throw error;
        }
    }

    static async getCurrentDayOutfit(userId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normaliza la fecha
            
            // 1. Buscar stacks activos (incluyendo los que empiezan hoy)
            const { rows: stacks } = await pool.query(
                `SELECT * FROM stack 
                 WHERE id_usuario = $1 
                 AND fecha_inicio <= $2 
                 AND fecha_final >= $2
                 ORDER BY fecha_inicio DESC`, // Ordena por el más reciente
                [userId, today]
            );
    
            if (!stacks || stacks.length === 0) {
                // 2. Si no hay stack, crear uno automáticamente (opcional)
                const newStack = await this.createStack(
                    userId, 
                    7, // 1 semana por defecto
                    true, // allowRepeats
                    'Casual', // estilo por defecto
                    {
                        superior: true,
                        inferior: true,
                        zapatos: true
                    }
                );
                return this.getCurrentDayOutfit(userId); // Recursión con el nuevo stack
            }
    
            const currentStack = stacks[0];
            const dayOfWeek = today.getDay(); // 0=Domingo, 1=Lunes...
            
            // 3. Buscar el outfit del día actual
            const { rows: outfits } = await pool.query(
                `SELECT o.*, 
                        json_agg(
                            json_build_object(
                                'id_prenda', p.id_prenda,
                                'nombre', p.nombre_prenda,
                                'categoria', cp.nombre_categoria,
                                'color', c.color_principal,
                                'imagen', p.ruta
                            )
                        ) AS items
                 FROM outfit o
                 JOIN outfit_prenda op ON o.id_outfit = op.id_outfit
                 JOIN prenda p ON op.id_prenda = p.id_prenda
                 JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
                 JOIN color c ON p.id_color = c.id_color
                 WHERE o.id_stack = $1 AND o.dia_semana = $2
                 GROUP BY o.id_outfit`,
                [currentStack.id_stack, dayOfWeek]
            );
    
            if (!outfits || outfits.length === 0) {
                throw new Error('No hay outfit generado para hoy');
            }
    
            // 4. Formatear respuesta
            const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            return {
                dia: DAYS[dayOfWeek],
                fecha: today.toISOString().split('T')[0],
                stack_id: currentStack.id_stack,
                estilo: outfits[0].estilo || 'General',
                items: outfits[0].items
            };
            
        } catch (error) {
            console.error('Error en getCurrentDayOutfit:', error);
            throw error;
        }
    }

}
module.exports = StackService;