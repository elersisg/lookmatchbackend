const OutfitService = require('../services/outfit.service');
const OutfitModel = require('../models/outfit.model');

class OutfitController {
    static async generateUniqueOutfit(req, res) {
        try {
            const userId = req.user.id_usuario;
            const { estilo, colorPrincipal } = req.body;
    
            const result = await OutfitService.generateRandomOutfit(userId, {
                estilo,
                colorPrincipal,
                isUnique: true
            });
    
            res.json(result);
    
        } catch (error) {
            const statusCode = error.details?.missingCategories ? 400 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.error || error.message,
                details: error.details,
                code: error.code
            });
        }
    }

    static async getByStack(req, res) {
        try {
            const { stackId } = req.params;
            const outfits = await Outfit.findByStack(stackId);
            
            if (!outfits || outfits.length === 0) {
                return res.status(404).json({ error: 'No se encontraron outfits para este stack' });
            }
            
            const formattedOutfits = outfits.map(outfit => ({
                id: outfit.id_outfit,
                items: {
                    superior: outfit.items.find(p => p.id_categoria === 2),
                    inferior: outfit.items.find(p => p.id_categoria === 3),
                    zapatos: outfit.items.find(p => p.id_categoria === 4),
                    exterior: outfit.items.find(p => p.id_categoria === 5)
                },
                fecha_asignada: outfit.fecha_asignada
            }));
            
            res.json(formattedOutfits);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getOutfitDetails(req, res) {
        try {
            const { outfitId } = req.params;
            const userId = req.user.id_usuario;
            
            const outfit = await OutfitService.getOutfitWithItems(outfitId, userId);
            
            if (!outfit) {
                return res.status(404).json({ 
                    error: 'Outfit no encontrado o no tienes permiso' 
                });
            }
            
            res.json({
                id: outfit.id_outfit,
                stackId: outfit.id_stack,
                estilo: outfit.estilo,
                favorito: outfit.favorito,
                items: outfit.items.map(item => ({
                    id: item.id_prenda,
                    nombre: item.nombre_prenda,
                    categoria: item.nombre_categoria,
                    subcategoria: item.nombre_subcategoria,
                    imagen: item.ruta
                }))
            });
        } catch (error) {
            console.error('Error en getOutfitDetails:', error);
            res.status(500).json({ error: 'Error al obtener outfit' });
        }
    }

    static async replacePrenda(req, res) {
        try {
            const { outfitId } = req.params;
            const { categoria, nuevaPrendaId } = req.body;
            const userId = req.user.id_usuario;
            
            const updatedOutfit = await OutfitService.replacePrendaInOutfit(
                outfitId, 
                userId, 
                categoria, 
                nuevaPrendaId
            );
            
            res.json({
                success: true,
                message: `Prenda ${categoria} actualizada exitosamente`,
                outfit: updatedOutfit
            });
        } catch (error) {
            console.error('Error en replacePrenda:', error);
            const statusCode = error.message.includes('no encontrado') ? 404 : 500;
            res.status(statusCode).json({ 
                error: error.message || 'Error al actualizar prenda' 
            });
        }
    }

    static async toggleFavorite(req, res) {
        try {
            const { id } = req.params;
            const { favorito } = req.body;
            const userId = req.user.id_usuario;
    
            const updatedOutfit = await OutfitModel.toggleFavorite(id, userId, favorito);
            
            if (!updatedOutfit) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Outfit no encontrado o no pertenece al usuario' 
                });
            }
    
            res.json({
                success: true,
                message: `Outfit ${favorito ? 'marcado como' : 'quitado de'} favoritos`,
                outfit: {
                    id: updatedOutfit.id_outfit,
                    favorito: updatedOutfit.favorito,
                    estilo: updatedOutfit.estilo
                }
            });
    
        } catch (error) {
            console.error('Error en toggleFavorite:', error);
            res.status(500).json({ 
                success: false,
                error: 'Error al actualizar favorito',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    static async getFavoriteOutfits(req, res) {
        try {
            const userId = req.user.id_usuario;
            const { favorito = 'true' } = req.query;
    
            const isFavorite = favorito === 'true';
            const outfits = await OutfitModel.getByFavorite(userId, isFavorite);
            
            if (!outfits || outfits.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: `No se encontraron outfits ${isFavorite ? 'favoritos' : ''}`,
                    showAddButton: isFavorite
                });
            }
    
            res.json({
                success: true,
                count: outfits.length,
                outfits: outfits.map(o => ({
                    id_outfit: o.id_outfit,
                    id_stack: o.id_stack,
                    estilo: o.estilo,
                    favorito: o.favorito,
                    fecha_creacion: o.fecha_creacion,
                    items: o.items.filter(item => item.id_prenda) // Filtrar items nulos
                                 .map(item => ({
                        id_prenda: item.id_prenda,
                        nombre_prenda: item.nombre_prenda,
                        nombre_categoria: item.nombre_categoria,
                        color_principal: item.color_principal,
                        ruta: item.ruta
                    }))
                }))
            });
    
        } catch (error) {
            console.error('Error en getFavoriteOutfits:', error);
            res.status(500).json({ 
                success: false,
                error: 'Error al obtener outfits favoritos',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    static async getOutfitsByDay(req, res) {
        try {
            const userId = req.user.id_usuario;
            const { dia } = req.query;

            if (!dia) {
                return res.status(400).json({ error: 'El parámetro "dia" es requerido' });
            }

            const filters = { dia };
            const outfits = await OutfitService.getFilteredOutfits(userId, filters);

            if (!outfits.length) {
                return res.status(404).json({
                    error: `No se encontraron outfits para el día: ${dia}`,
                    dia
                });
            }

            res.json(outfits);
        } catch (error) {
            console.error('Error en getOutfitsByDay:', error);
            res.status(500).json({
                error: 'Error interno al obtener outfits por día',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }


}

module.exports = OutfitController;