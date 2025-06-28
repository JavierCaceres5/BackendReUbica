import * as ratingsService from "../services/ratings.services.js";
import * as productoService from "../services/producto.service.js";


export async function getRatingsByEmprendimientoController(req, res) {
  try {
    const { id: emprendimientoID } = req.params;

    const productos = await productoService.getProductosByEmprendimientoID(emprendimientoID);

    if (!productos.length) {
      return res.status(404).json({ error: "No hay productos para este emprendimiento" });
    }

    const resultados = [];

    for (const producto of productos) {
      const ratings = await ratingsService.getRatingsByProductoID(producto.id);
      resultados.push({
        productoID: producto.id,
        nombre: producto.nombre,
        valoraciones: ratings,
      });
    }

    res.json(resultados);
  } catch (error) {
    console.error("Error obteniendo valoraciones:", error);
    res.status(500).json({ error: "Error al obtener valoraciones del emprendimiento" });
  }
}

export async function createRatingController(req, res) {
  try {
    const userID = req.user.id;
    const productoID = req.params.productoID;
    const { comentario, rating } = req.body;

    const existing = await ratingsService.getRating(userID, productoID);
    if (existing) {
      return res.status(409).json({ error: "Ya has valorado este producto." });
    }

    const nueva = await ratingsService.createRating({
      userID,
      productoID,
      comentario,
      rating,
    });
    return res.status(201).json({ rating: nueva });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ error: "Error al guardar la valoración" });
  }
}

export async function deleteRatingController(req, res) {
  try {
    const userID = req.user.id;
    const productoID = req.params.productoID;

    const existing = await ratingsService.getRating(userID, productoID);
    if (!existing) {
      return res.status(404).json({ error: "No has valorado este producto." });
    }

    await ratingsService.deleteRating(userID, productoID);
    return res
      .status(200)
      .json({ message: "Valoración eliminada exitosamente." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar la valoración" });
  }
}
