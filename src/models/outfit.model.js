const {pool} = require('../config/dbConfig');
const cloudinary = require('../middleware/cloudinary.js');

class Outfit {
    static async create(userId, estilo, stackId = null, diaAsignado = null, stackStartDate = null) {
        // Validación de tipos
        if (typeof estilo !== 'string') {
            throw new Error('El estilo debe ser un string');
        }
        if (stackId && isNaN(parseInt(stackId))) {
            throw new Error('stackId debe ser un número');
        }
    
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            if (!stackId) {
                await client.query(`
                    DELETE FROM outfit_prenda 
                    WHERE id_outfit IN (
                        SELECT id_outfit FROM outfit 
                        WHERE id_usuario = $1 AND id_stack IS NULL
                    )`, 
                    [userId]
                );
                
                await client.query(
                    `DELETE FROM outfit 
                     WHERE id_usuario = $1 AND id_stack IS NULL`,
                    [userId]
                );
            }
    
            // Calcular fecha asignada basada en el día y fecha de inicio del stack
            let fechaAsignada = null;
            if (diaAsignado && stackStartDate) {
                const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                const diaIndex = diasSemana.indexOf(diaAsignado);
                
                if (diaIndex >= 0) {
                    const fechaInicio = new Date(stackStartDate);
                    // Calcular diferencia absoluta desde el inicio del stack
                    const diffDias = (diaIndex - fechaInicio.getDay() + 7) % 7;
                    fechaAsignada = new Date(fechaInicio);
                    fechaAsignada.setDate(fechaInicio.getDate() + diffDias);
                    fechaAsignada = fechaAsignada.toISOString();
                }
            }
    
            const result = await client.query(
                `INSERT INTO outfit (id_usuario, estilo, id_stack, fecha_asignada) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING *`,
                [userId, estilo, stackId ? parseInt(stackId) : null, fechaAsignada]
            );
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error en Outfit.create:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Nuevo método para outfits únicos
    static async createUnique(userId, estilo = null) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 1. Eliminar cualquier outfit único existente
            await client.query(
                `DELETE FROM outfit 
                 WHERE id_usuario = $1 AND id_stack IS NULL`,
                [userId]
            );
            
            // 2. Crear nuevo outfit único
            const result = await client.query(
                `INSERT INTO outfit (id_usuario, estilo) 
                 VALUES ($1, $2) 
                 RETURNING *`,
                [userId, estilo]
            );
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error en createUnique:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async addPrendaToOutfit(outfitId, prendaId) {
        const query = `
            INSERT INTO outfit_prenda (id_outfit, id_prenda)
            VALUES ($1, $2)
        `;
        await pool.query(query, [outfitId, prendaId]);
    }

    static async findByStack(stackId) {
        const query = `
        SELECT 
            o.*,
            CASE 
                WHEN o.fecha_asignada IS NOT NULL THEN
                    CASE TO_CHAR(o.fecha_asignada, 'TMDay')
                        WHEN 'Monday' THEN 'Lunes'
                        WHEN 'Tuesday' THEN 'Martes'
                        WHEN 'Wednesday' THEN 'Miércoles'
                        WHEN 'Thursday' THEN 'Jueves'
                        WHEN 'Friday' THEN 'Viernes'
                        WHEN 'Saturday' THEN 'Sábado'
                        WHEN 'Sunday' THEN 'Domingo'
                        ELSE 'No asignado'
                    END
                ELSE 'No asignado'
            END as dia,
            o.favorito,
            json_agg(json_build_object(
                'id_prenda', p.id_prenda,
                'nombre_prenda', p.nombre_prenda,
                'estilo', p.estilo,
                'id_categoria', p.id_categoria,
                'nombre_categoria', cp.nombre_categoria,
                'nombre_subcategoria', sc.nombre_subcategoria,
                'ruta', p.ruta,
                'id_color', c.id_color,
                'color_principal', c.color_principal,
                'favorito', p.favorito
            )) as items
        FROM outfit o
        JOIN outfit_prenda op ON o.id_outfit = op.id_outfit
        JOIN prenda p ON op.id_prenda = p.id_prenda
        JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
        LEFT JOIN subcategoria_prenda sc ON p.id_subcategoria = sc.id_subcategoria
        LEFT JOIN color c ON p.id_color = c.id_color
        WHERE o.id_stack = $1
        GROUP BY o.id_outfit
        ORDER BY o.fecha_asignada
        `;
        const { rows } = await pool.query(query, [stackId]);
        return rows;
    }

    static async findById(outfitId) {
        const query = `
        SELECT 
            o.*,
            TO_CHAR(o.fecha_asignada, 'TMDay') as dia,
            json_agg(json_build_object(
                'id_prenda', p.id_prenda,
                'nombre_prenda', p.nombre_prenda,
                'estilo', p.estilo,
                'id_categoria', p.id_categoria,
                'nombre_categoria', cp.nombre_categoria,
                'nombre_subcategoria', sc.nombre_subcategoria,
                'ruta', p.ruta,
                'id_color', c.id_color,
                'color_principal', c.color_principal
            )) as items
        FROM outfit o
        LEFT JOIN outfit_prenda op ON o.id_outfit = op.id_outfit
        LEFT JOIN prenda p ON op.id_prenda = p.id_prenda
        LEFT JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
        LEFT JOIN subcategoria_prenda sc ON p.id_subcategoria = sc.id_subcategoria
        LEFT JOIN color c ON p.id_color = c.id_color
        WHERE o.id_outfit = $1
        GROUP BY o.id_outfit
        `;
        const { rows } = await pool.query(query, [outfitId]);
        return rows[0] || null;
    }
    
    static async toggleFavorite(outfitId, userId, favorito) {
        const query = `
            UPDATE outfit 
            SET favorito = $1
            WHERE id_outfit = $2 AND id_usuario = $3
            RETURNING *
        `;
        const { rows } = await pool.query(query, [favorito, outfitId, userId]);
        return rows[0];
    }
    
    static async getByFavorite(userId, favorito = true) {
        const query = `
            SELECT o.*,
                   json_agg(json_build_object(
                       'id_prenda', p.id_prenda,
                       'nombre_prenda', p.nombre_prenda,
                       'ruta', p.ruta,
                       'color_principal', c.color_principal,
                       'id_categoria', p.id_categoria,
                       'nombre_categoria', cp.nombre_categoria
                   )) as items
            FROM outfit o
            LEFT JOIN outfit_prenda op ON o.id_outfit = op.id_outfit
            LEFT JOIN prenda p ON op.id_prenda = p.id_prenda
            LEFT JOIN color c ON p.id_color = c.id_color
            LEFT JOIN categoria_prenda cp ON p.id_categoria = cp.id_categoria
            WHERE o.id_usuario = $1 AND o.favorito = $2
            GROUP BY o.id_outfit
        `;
        const { rows } = await pool.query(query, [userId, favorito]);
        return rows;
    }
}

module.exports = Outfit;