import { ratingsService } from '../services/ratings.service.js';

export async function createRatingController(req, res) {
  try {
    const userID = req.user.id;
    const { productoID, comentario, rating } = req.body;

    const existing = await ratingsService.getRating(userID, productoID);
    if (existing) {
      return res.status(409).json({ error: 'Ya has valorado este producto.' });
    }

    const nueva = await ratingsService.createRating({ userID, productoID, comentario, rating });
    return res.status(201).json({ rating: nueva });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al guardar la valoración' });
  }
}

export async function deleteRatingController(req, res) {
  try {
    const userID = req.user.id;
    const { productoID } = req.body;

    const existing = await ratingsService.getRating(userID, productoID);
    if (!existing) {
      return res.status(404).json({ error: 'No has valorado este producto.' });
    }

    await ratingsService.deleteRating(userID, productoID);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al eliminar la valoración' });
  }
}
