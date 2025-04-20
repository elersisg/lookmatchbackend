const PrendaModel = require('../models/prenda.model');
const Outfit = require('../models/outfit.model');
const { pool } = require('../config/dbConfig');

const DAYS_TRANSLATION = {
    'monday': 'Lunes',
    'tuesday': 'Martes',
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado',
    'sunday': 'Domingo'
};

const COLOR_COMBINATIONS = {
    'Blanco': ['Negro', 'Rojo', 'Azul', 'Verde', 'Gris', 'Marrón', 'Rosado', 'Morado'],
    'Negro': ['Blanco', 'Rojo', 'Amarillo', 'Gris', 'Rosado', 'Azul', 'Verde'],
    'Gris': ['Rojo', 'Azul', 'Rosado', 'Verde', 'Negro', 'Blanco'],
    'Rojo': ['Negro', 'Blanco', 'Gris', 'Amarillo'],
    'Naranja': ['Negro', 'Blanco', 'Gris', 'Azul'],
    'Amarillo': ['Negro', 'Blanco', 'Gris', 'Azul', 'Morado'],
    'Verde': ['Negro', 'Blanco', 'Gris', 'Amarillo', 'Marrón'],
    'Azul': ['Negro', 'Blanco', 'Gris', 'Naranja', 'Amarillo'],
    'Morado': ['Negro', 'Blanco', 'Gris', 'Amarillo', 'Rosado'],
    'Rosado': ['Negro', 'Blanco', 'Gris', 'Morado', 'Azul'],
    'Marrón': ['Blanco', 'Beige', 'Verde', 'Amarillo'],
    'Beige': ['Negro', 'Blanco', 'Marrón', 'Azul', 'Verde']
};

// Función para obtener la clave en inglés a partir del valor en español
const getEnglishDay = (spanishDay) => {
    for (const englishDay in DAYS_TRANSLATION) {
        if (DAYS_TRANSLATION[englishDay].toLowerCase() === spanishDay.toLowerCase()) {
            return englishDay;
        }
    }
    return null;
};


class OutfitService {
    static generateOutfit(prendas, disponibilidad, selectedCategories) {
        const { 
            superior: wantSuperior, 
            inferior: wantInferior, 
            zapatos: wantZapatos, 
            exterior: wantExterior, 
            monopieza: wantMonopieza 
        } = selectedCategories;
    
        // 1. Agrupar prendas por estilo y categoría
        const grouped = this.groupByCategoryAndStyle(prendas); // <-- DEFINIR grouped ANTES de usarla

         // Caso especial: solo monopieza + zapatos
    if (wantMonopieza && !wantSuperior && !wantInferior) {
        const outfit = [];
        const estilosDisponiblesMonopieza = Object.keys(grouped).filter(estilo =>
            (wantZapatos ? grouped[estilo]?.zapatos?.length > 0 : true) &&
            (wantMonopieza ? grouped[estilo]?.monopieza?.length > 0 : true)
        );

        if (estilosDisponiblesMonopieza.length > 0) {
            const estiloMonopieza = estilosDisponiblesMonopieza[Math.floor(Math.random() * estilosDisponiblesMonopieza.length)];
            const prendasEstiloMonopieza = grouped[estiloMonopieza];

            if (wantZapatos && prendasEstiloMonopieza?.zapatos?.length > 0) {
                outfit.push(prendasEstiloMonopieza.zapatos[0]); // Tomar primer zapato
            }
            if (prendasEstiloMonopieza?.monopieza?.length > 0) {
                outfit.push(prendasEstiloMonopieza.monopieza[0]); // Tomar primera monopieza
            }
            return outfit.length > 0 ? outfit : null;
        } else {
            return null; // No hay estilos disponibles con monopieza y/o zapatos
        }
    }

        // 2. Ahora filtrar estilos disponibles
        const estilosDisponibles = Object.keys(grouped).filter(estilo => {
            const g = grouped[estilo];
            const tieneZapatos = wantZapatos ? g.zapatos.length > 0 : true;
            const tieneMonopieza = wantMonopieza ? g.monopieza.length > 0 : true;
            const tieneSuperInferior = (wantSuperior ? g.superior.length > 0 : true) && 
                                     (wantInferior ? g.inferior.length > 0 : true);
    
            return tieneZapatos && (tieneMonopieza || tieneSuperInferior || (!wantSuperior && !wantInferior));
        });
    
        if (estilosDisponibles.length === 0) {
            throw new Error('No hay estilos con prendas compatibles');
        }
    
        // 2. Seleccionar un estilo aleatorio con prendas disponibles
        const estilo = estilosDisponibles[Math.floor(Math.random() * estilosDisponibles.length)];
        const prendasEstilo = grouped[estilo];
        const outfit = [];
    
        // 3. Añadir zapatos (si están seleccionados)
        if (wantZapatos && prendasEstilo.zapatos.length > 0) {
            outfit.push(prendasEstilo.zapatos[
                Math.floor(Math.random() * prendasEstilo.zapatos.length)
            ]);
        }
    
        // 4. Elegir entre monopieza o superior+inferior
        const puedeMonopieza = wantMonopieza && prendasEstilo.monopieza.length > 0;
        const puedeSuperInferior = wantSuperior && wantInferior && 
                                  prendasEstilo.superior.length > 0 && 
                                  prendasEstilo.inferior.length > 0;
    
        if (puedeMonopieza && (!puedeSuperInferior || Math.random() > 0.5)) {
            outfit.push(prendasEstilo.monopieza[
                Math.floor(Math.random() * prendasEstilo.monopieza.length)
            ]);
        } else if (puedeSuperInferior) {
            outfit.push(prendasEstilo.superior[
                Math.floor(Math.random() * prendasEstilo.superior.length)
            ]);
            outfit.push(prendasEstilo.inferior[
                Math.floor(Math.random() * prendasEstilo.inferior.length)
            ]);
        }
    
        // 5. Añadir exterior (opcional)
        if (wantExterior && prendasEstilo.exterior.length > 0 && Math.random() > 0.7) {
            outfit.push(prendasEstilo.exterior[
                Math.floor(Math.random() * prendasEstilo.exterior.length)
            ]);
        }
    
        return outfit.length > 0 ? outfit : null;
    }
    
    static async generateAndGetOutfits(userId, stackId, count, allowRepeats = false, styles = [], selectedCategories = {}, stackStartDate) {
    // Obtener fecha de inicio del stack
    const fechaInicio = new Date(stackStartDate);
    const diasSemanaEspanol = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        try {

            console.log(`Fetching clothes for user ${userId} with styles:`, styles);
            console.log('Selected categories:', selectedCategories);
            
            // Obtener prendas (con o sin filtro de estilos)
            const prendas = styles && styles.length > 0 
                ? await PrendaModel.getByCategoriesAndStyle(userId, styles)
                : await PrendaModel.getByCategories(userId);
            
            if (!prendas || prendas.length === 0) {
                const errorMsg = styles && styles.length > 0
                    ? 'No se encontraron prendas para los estilos especificados'
                    : 'No se encontraron prendas disponibles';
                return { success: false, error: errorMsg };
            }

            // Filtrar prendas por categorías seleccionadas
            const categoriasPermitidas = [];
            if (selectedCategories.superior) categoriasPermitidas.push(1);
            if (selectedCategories.inferior) categoriasPermitidas.push(2);
            if (selectedCategories.zapatos) categoriasPermitidas.push(3);
            if (selectedCategories.exterior) categoriasPermitidas.push(4);
            if (selectedCategories.monopieza) categoriasPermitidas.push(5);

            const prendasFiltradas = categoriasPermitidas.length > 0
                ? prendas.filter(p => categoriasPermitidas.includes(p.id_categoria))
                : prendas;

            if (prendasFiltradas.length === 0) {
                return {
                    success: false,
                    error: 'No hay prendas en las categorías seleccionadas'
                };
            }

            // Debug: Log categories found
            const categoriesFound = [...new Set(prendasFiltradas.map(p => p.id_categoria))];
            console.log('Categories found:', categoriesFound);

            const disponibilidad = this.checkAvailability(prendasFiltradas);
            console.log('Estilos compatibles:', disponibilidad.estilosCompatibles);

            if (!disponibilidad.puedeGenerarOutfits) {
                return {
                    success: false,
                    error: 'No hay prendas compatibles en los estilos seleccionados',
                    solution: 'Verifica que tengas al menos un conjunto completo (zapatos + superior/inferior o monopieza) del mismo estilo'
                };
            }

            const maxUnicos = this.calculateMaxOutfits(prendasFiltradas);
            const outfits = [];
            const uniqueOutfits = new Set();

            while (uniqueOutfits.size < Math.min(count, maxUnicos)) {
                let prendasOutfit;
                try {
                    prendasOutfit = this.generateOutfit(prendasFiltradas, disponibilidad, selectedCategories);
                } catch (genError) {
                    console.warn('Outfit generation error:', genError.message);
                    continue;
                }
    
                if (!prendasOutfit || prendasOutfit.length === 0) continue;
    
                const outfitKey = JSON.stringify(prendasOutfit.map(p => p.id_prenda).sort());
                
                if (!uniqueOutfits.has(outfitKey)) {
                    uniqueOutfits.add(outfitKey);

                // Calcular día y fecha correspondiente
                const diaOffset = uniqueOutfits.size;
                const diaSemanaIndex = (fechaInicio.getDay() + diaOffset) % 7;
                const diaSemana = diasSemanaEspanol[diaSemanaIndex];

                   const estilo = prendasOutfit[0]?.estilo;
                    const createdOutfit = await Outfit.create(
                        userId, 
                        estilo, 
                        stackId,
                        diaSemana,
                        stackStartDate 
                    );
    
                    for (const prenda of prendasOutfit) {
                        if (!prenda?.id_prenda) continue;
                        await Outfit.addPrendaToOutfit(createdOutfit.id_outfit, prenda.id_prenda);
                    }
    
                    const fullOutfit = await Outfit.findById(createdOutfit.id_outfit);
                    if (fullOutfit) {
                        outfits.push(fullOutfit);
                    }
                }
            }
            if (outfits.length === 0) {
                return {
                    success: false,
                    error: 'No se pudieron generar outfits válidos con las categorías seleccionadas',
                    solution: 'Intenta con diferentes combinaciones de categorías o estilos'
                };
            }

            return {
                success: true,
                data: {
                    outfits: outfits,
                    total: outfits.length,
                    uniqueCount: uniqueOutfits.size,
                    maxUniquePossible: maxUnicos,
                    containsRepeats: outfits.length > uniqueOutfits.size,
                    requestedCount: count,
                    usedCategories: selectedCategories 
                }
            };
        } catch (error) {
            console.error('Error in generateAndGetOutfits:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }


    static generateOutfitFromSameStyle(prendas) {
        // Filtros por categoría
        const zapatos = prendas.filter(p => p.id_categoria === 3);
        const superiores = prendas.filter(p => p.id_categoria === 1);
        const inferiores = prendas.filter(p => p.id_categoria === 2);
        const monopiezas = prendas.filter(p => p.id_categoria === 5);
        const exteriores = prendas.filter(p => p.id_categoria === 4);

        if (zapatos.length === 0) return null; // Outfit inválido sin zapatos

        const outfit = [];
        // 1. Añadir zapatos (obligatorio)
        outfit.push(zapatos[Math.floor(Math.random() * zapatos.length)]);

        // 2. Elegir entre monopieza o superior+inferior
        const puedeMonopieza = monopiezas.length > 0;
        const puedeSuperInferior = superiores.length > 0 && inferiores.length > 0;

        if (puedeMonopieza && (!puedeSuperInferior || Math.random() > 0.5)) {
            outfit.push(monopiezas[Math.floor(Math.random() * monopiezas.length)]);
        } else if (puedeSuperInferior) {
            outfit.push(superiores[Math.floor(Math.random() * superiores.length)]);
            outfit.push(inferiores[Math.floor(Math.random() * inferiores.length)]);
        } else {
            return null; // No hay combinación válida
        }

        // 3. Añadir exterior (opcional, 30% probabilidad)
        if (exteriores.length > 0 && Math.random() > 0.7) {
            outfit.push(exteriores[Math.floor(Math.random() * exteriores.length)]);
        }

        return outfit;
    }

    static groupByCategoryAndStyle(prendas) {
        const grouped = {};
        
        prendas.forEach(prenda => {
            if (!grouped[prenda.estilo]) {
                grouped[prenda.estilo] = {
                    superior: [],
                    inferior: [],
                    zapatos: [], 
                    exterior: [],
                    monopieza: []
                };
            }
        
            switch(prenda.id_categoria) {
                case 1: grouped[prenda.estilo].superior.push(prenda); break;
                case 2: grouped[prenda.estilo].inferior.push(prenda); break;
                case 3: grouped[prenda.estilo].zapatos.push(prenda); break; 
                case 4: grouped[prenda.estilo].exterior.push(prenda); break;
                case 5: grouped[prenda.estilo].monopieza.push(prenda); break;
            }
        });
        
        return grouped;
    }
    static checkStyleAvailability(categoriasDisponibles) {
        const tieneZapatos = categoriasDisponibles.includes(3);
        const tieneSuperInferior = categoriasDisponibles.includes(1) && categoriasDisponibles.includes(2);
        const tieneMonopieza = categoriasDisponibles.includes(5);
        
        return tieneZapatos && (tieneSuperInferior || tieneMonopieza);
    }

    static checkAvailability(prendas) {
        const grouped = this.groupByCategoryAndStyle(prendas);
        const disponibilidad = {
            tieneMonopieza: false,
            tieneSuperior: false,
            tieneInferior: false,
            tieneZapatos: false,
            tieneExterior: false,
            estilosCompatibles: []
        };
    
        Object.entries(grouped).forEach(([estilo, categorias]) => {
            const tieneZapatos = categorias.zapatos.length > 0;
            const tieneSuperInferior = categorias.superior.length > 0 && categorias.inferior.length > 0;
            const tieneMonopieza = categorias.monopieza.length > 0;
    
            if (tieneZapatos && (tieneSuperInferior || tieneMonopieza)) {
                disponibilidad.estilosCompatibles.push(estilo);
                disponibilidad.tieneMonopieza = disponibilidad.tieneMonopieza || tieneMonopieza;
                disponibilidad.tieneSuperior = disponibilidad.tieneSuperior || categorias.superior.length > 0;
                disponibilidad.tieneInferior = disponibilidad.tieneInferior || categorias.inferior.length > 0;
                disponibilidad.tieneZapatos = true;
                disponibilidad.tieneExterior = disponibilidad.tieneExterior || categorias.exterior.length > 0;
            }
        });
    
        disponibilidad.tieneSuperInferior = disponibilidad.tieneSuperior && disponibilidad.tieneInferior;
        disponibilidad.puedeGenerarOutfits = disponibilidad.estilosCompatibles.length > 0;
    
        return disponibilidad;
    }

    static calculateMaxOutfits(prendas) {
        const contarPrendas = (idCategoria) => 
            prendas.filter(p => p.id_categoria === idCategoria).length;
    
        const zapatos = contarPrendas(3);
        const superior = contarPrendas(1);
        const inferior = contarPrendas(2);
        const monopieza = contarPrendas(5);
        const exterior = contarPrendas(4) || 1;
    
        const combinacionesSuperInferior = superior * inferior;
        const combinacionesTotales = monopieza + combinacionesSuperInferior;
    
        return zapatos * combinacionesTotales * exterior;
    }

    static calculateMaxOutfitsByStyles(prendasPorEstilo) {
        return Object.values(prendasPorEstilo).reduce((total, estiloData) => {
            const categorias = Array.from(estiloData.categorias);
            const disponibilidad = {
                tieneZapatos: categorias.includes(3),
                tieneSuperior: categorias.includes(1),
                tieneInferior: categorias.includes(2),
                tieneMonopieza: categorias.includes(5)
            };
            
            if (!disponibilidad.tieneZapatos) return total;
            
            const combinaciones = 
                (disponibilidad.tieneMonopieza ? estiloData.prendas.filter(p => p.id_categoria === 5).length : 0) +
                (disponibilidad.tieneSuperior && disponibilidad.tieneInferior 
                    ? estiloData.prendas.filter(p => p.id_categoria === 1).length * 
                      estiloData.prendas.filter(p => p.id_categoria === 2).length 
                    : 0);
            
            return total + combinaciones;
        }, 0);
    }

    // Helper para obtener colores que combinan
    static getCombinationColors(baseColor) {
        return COLOR_COMBINATIONS[baseColor] || Object.keys(COLOR_COMBINATIONS);
    }

    static async generateRandomOutfit(userId, options = {}) {
        const { estilo, colorPrincipal, isUnique = false, stackId = null } = options;
        
        try {
            // 1. Configuración de categorías
            const CATEGORIAS = {
                1: 'Superior',
                2: 'Inferior',
                3: 'Zapatos',
                4: 'Exterior',
                5: 'Monopieza'
            };
            const CATEGORIAS_BASICAS = [1, 2, 3]; // Superior, Inferior, Zapatos
    
            // 2. Obtener prendas con información de color
            const prendas = await PrendaModel.getByUserWithColors(userId);
    
            // 3. Verificación básica de categorías (sin filtros)
            const categoriasFaltantes = CATEGORIAS_BASICAS
                .filter(id => !prendas.some(p => p.id_categoria == id))
                .map(id => CATEGORIAS[id]);
    
            if (categoriasFaltantes.length > 0) {
                throw {
                    message: 'No hay suficientes prendas para generar el outfit',
                    missingCategories: categoriasFaltantes,
                    solution: `Agrega al menos 1 prenda en: ${categoriasFaltantes.join(', ')}`
                };
            }
    
            // 4. Selección de prendas con lógica de color
            const selectedPrendas = [];
            const colorFilter = colorPrincipal?.toLowerCase();
    
            for (const categoriaId of CATEGORIAS_BASICAS) {
                let disponibles = prendas.filter(p => p.id_categoria == categoriaId);
                
                // Priorizar prendas con el color solicitado si existe
                if (colorFilter) {
                    const prendasConColor = disponibles.filter(p => 
                        p.color_principal?.toLowerCase().includes(colorFilter)
                    );
                    
                    if (prendasConColor.length > 0) {
                        disponibles = prendasConColor;
                    }
                    // Si no hay prendas con el color, usa las disponibles normales
                }
    
                const randomIndex = Math.floor(Math.random() * disponibles.length);
                selectedPrendas.push(disponibles[randomIndex]);
            }
    
        // Creación del outfit (siempre eliminará únicos si stackId es null)
        const outfit = await Outfit.create(userId, estilo, stackId);
    
            // 6. Asociar prendas
            await Promise.all(
                selectedPrendas.map(prenda => 
                    Outfit.addPrendaToOutfit(outfit.id_outfit, prenda.id_prenda)
                )
            );
    
            // 7. Verificar si se incluyó el color solicitado
            const incluyeColorSolicitado = colorPrincipal 
                ? selectedPrendas.some(p => 
                    p.color_principal?.toLowerCase().includes(colorPrincipal.toLowerCase())
                  )
                : true;
    
            return {
                success: true,
                outfit: {
                    id: outfit.id_outfit,
                    estilo: outfit.estilo,
                    favorito: outfit.favorito || false, 
                    incluyeColorSolicitado,
                    items: selectedPrendas.map(p => ({
                        id_prenda: p.id_prenda,
                        nombre_prenda: p.nombre_prenda,
                        nombbre_categoria: CATEGORIAS[p.id_categoria],
                        color_principal: p.color_principal,
                        ruta: p.ruta
                    }))
                }
            };
    
        } catch (error) {
            console.error('Error en generateRandomOutfit:', {
                error: error.message,
                filters: { colorPrincipal, estilo }
            });
            
            throw {
                success: false,
                error: error.message || 'Error al generar outfit',
                details: error.missingCategories ? {
                    missingCategories: error.missingCategories,
                    solution: error.solution
                } : undefined,
                code: error.code || 'OUTFIT_GENERATION_ERROR'
            };
        }
    }

    static async getRandomPrendaByCategory(client, userId, category, estilo, colorPrincipal) {
        let query = `
            SELECT p.*, c.color_principal
            FROM prenda p
            JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
            LEFT JOIN color c ON p.id_color = c.id_color
            WHERE p.id_usuario = $1 AND cp.nombre_categoria = $2
            AND p.status = true
        `;
        const params = [userId, category];

        if (estilo) {
            query += ` AND p.estilo = $${params.length + 1}`;
            params.push(estilo);
        }

        if (colorPrincipal) {
            const compatibleColors = this.getCombinationColors(colorPrincipal);
            query += ` AND (c.color_principal = ANY($${params.length + 1}))`;
            params.push(compatibleColors);
        }

        query += ` ORDER BY RANDOM() LIMIT 1`;

        console.log('Ejecutando query:', query, params);
        const { rows } = await client.query(query, params);
        return rows[0];
    }

    static async getOutfitWithItems(outfitId, userId) {
        const query = `
            SELECT 
                o.id_outfit,
                o.id_stack,
                o.estilo,
                o.favorito,
                json_agg(json_build_object(
                    'id_prenda', p.id_prenda,
                    'nombre_prenda', p.nombre_prenda,
                    'nombre_categoria', cp.nombre_categoria,
                    'nombre_subcategoria', sc.nombre_subcategoria,
                    'ruta', p.ruta
                )) as items
            FROM outfit o
            JOIN outfit_prenda op ON o.id_outfit = op.id_outfit
            JOIN prenda p ON op.id_prenda = p.id_prenda
            JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
            LEFT JOIN subcategoria_prenda sc ON p.id_subcategoria = sc.id_subcategoria
            WHERE o.id_outfit = $1 AND o.id_usuario = $2
            GROUP BY o.id_outfit
        `;
        
        const { rows } = await pool.query(query, [outfitId, userId]);
        return rows[0];
    }
    
    static async replacePrendaInOutfit(outfitId, userId, categoria, nuevaPrendaId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
    
            // 1. Verificar que el outfit pertenece al usuario
            const outfit = await client.query(
                'SELECT id_outfit FROM outfit WHERE id_outfit = $1 AND id_usuario = $2',
                [outfitId, userId]
            );
            
            if (outfit.rows.length === 0) {
                throw new Error('Outfit no encontrado');
            }
    
            // 2. Verificar nueva prenda
            const [prendaValida, currentPrenda] = await Promise.all([
                client.query(`
                    SELECT 1 FROM prenda 
                    WHERE id_prenda = $1 AND id_usuario = $2
                    AND id_categoria = (SELECT id_categoria FROM categoria_prenda WHERE nombre_categoria = $3)
                `, [nuevaPrendaId, userId, categoria]),
                
                client.query(`
                    SELECT op.id_prenda 
                    FROM outfit_prenda op
                    JOIN prenda p ON op.id_prenda = p.id_prenda
                    JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
                    WHERE op.id_outfit = $1 AND cp.nombre_categoria = $2
                `, [outfitId, categoria])
            ]);
    
            if (prendaValida.rows.length === 0) {
                throw new Error('Prenda no válida o categoría incorrecta');
            }
    
            if (currentPrenda.rows.length === 0) {
                throw new Error('No existe prenda actual en esa categoría');
            }
    
            // 3. Actualizar prenda
            await client.query(`
                UPDATE outfit_prenda
                SET id_prenda = $1
                WHERE id_outfit = $2 AND id_prenda = $3
            `, [nuevaPrendaId, outfitId, currentPrenda.rows[0].id_prenda]);
    
            // 4. Obtener outfit actualizado
            const updatedOutfit = await this.getOutfitWithItems(outfitId, userId);
            
            await client.query('COMMIT');
            return updatedOutfit;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getFilteredOutfits(userId, filters = {}) {
        try {
            let query = `
                SELECT
                    o.*,
                    CASE
                        WHEN o.fecha_asignada IS NOT NULL
                        THEN LOWER(TO_CHAR(o.fecha_asignada, 'TMDay'))
                        ELSE 'no asignado'
                    END as dia_semana_en,
                    json_agg(json_build_object(
                        'id_prenda', p.id_prenda,
                        'nombre_prenda', p.nombre_prenda,
                        'estilo', p.estilo,
                        'id_categoria', p.id_categoria,
                        'nombre_categoria', cp.nombre_categoria,
                        'nombre_subcategoria', sc.nombre_subcategoria,
                        'ruta', p.ruta,
                        'color_principal', c.color_principal
                    ) ORDER BY p.id_categoria) as items
                FROM outfit o
                LEFT JOIN outfit_prenda op ON o.id_outfit = op.id_outfit
                LEFT JOIN prenda p ON op.id_prenda = p.id_prenda
                LEFT JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
                LEFT JOIN subcategoria_prenda sc ON p.id_subcategoria = sc.id_subcategoria
                LEFT JOIN color c ON p.id_color = c.id_color
                WHERE o.id_usuario = $1
            `;

            const values = [userId];
            let filterCount = 2;

            // Filtro por día
            if (filters.dia) {
                const englishDay = filters.dia.toLowerCase();
                if (Object.keys(DAYS_TRANSLATION).includes(englishDay)) {
                    query += ` AND LOWER(TO_CHAR(o.fecha_asignada, 'TMDay')) = $${filterCount}`;
                    values.push(englishDay);
                    filterCount++;
                }
            }

            // Filtro por favorito
            if (filters.favorito !== undefined) {
                query += ` AND o.favorito = $${filterCount}`;
                values.push(filters.favorito);
                filterCount++;
            }

            // Filtro por tipo (únicos o de stack)
            if (filters.tipo === 'unique') {
                query += ` AND o.id_stack IS NULL`;
            } else if (filters.tipo === 'stack') {
                query += ` AND o.id_stack IS NOT NULL`;
            }

            query += `
                GROUP BY o.id_outfit, dia_semana_en
                ORDER BY 
                    CASE WHEN o.id_stack IS NULL THEN 1 ELSE 0 END, -- Outfits únicos primero
                    o.fecha_asignada DESC
            `;

            const { rows } = await pool.query(query, values);
            
            return rows.map(row => ({
                ...row,
                tipo: row.id_stack ? 'stack' : 'unique', // Agregar tipo
                dia: DAYS_TRANSLATION[row.dia_semana_en] || row.dia_semana_en
            }));

        } catch (error) {
            console.error('Error en getFilteredOutfits:', error);
            throw error;
        }
    }
        static async setFavoritoStatus(outfitId, userId, favorito) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                
                // Verificar que el outfit pertenece al usuario
                const checkQuery = `
                    SELECT id_outfit FROM outfit 
                    WHERE id_outfit = $1 AND id_usuario = $2
                `;
                const { rows } = await client.query(checkQuery, [outfitId, userId]);
                
                if (rows.length === 0) {
                    return null;
                }
        
                // Actualizar estado de favorito
                const updateQuery = `
                    UPDATE outfit 
                    SET favorito = $1
                    WHERE id_outfit = $2
                    RETURNING *
                `;
                const { rows: updated } = await client.query(updateQuery, [favorito, outfitId]);
                
                await client.query('COMMIT');
                return updated[0];
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }
}

module.exports = OutfitService;