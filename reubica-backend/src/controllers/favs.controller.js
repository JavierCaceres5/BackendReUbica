import * as favoritosService from "../services/favs.service.js";

export async function toggleFavoriteController(req, res) {
  try {
    const userID = req.user.id;
    const { tipo_objetivo, productoID, emprendimientoID } = req.body;

    // console.log("userID:", userID);
    // console.log("tipo_objetivo:", tipo_objetivo);
    // console.log("productoID:", productoID);
    // console.log("emprendimientoID:", emprendimientoID);

    if (tipo_objetivo === "producto" && !productoID) {
      return res
        .status(400)
        .json({ error: "Falta el productoID para tipo producto" });
    }

    if (tipo_objetivo === "emprendimiento" && !emprendimientoID) {
      return res
        .status(400)
        .json({ error: "Falta el emprendimientoID para tipo emprendimiento" });
    }

    const alreadyFavorite = await favoritosService.favExists({
      userID,
      tipo_objetivo,
      productoID,
      emprendimientoID,
    });

    if (alreadyFavorite) {
      await favoritosService.deleteFavorite(
        userID,
        tipo_objetivo,
        productoID,
        emprendimientoID
      );
      return res.status(200).json({ message: "Favorito eliminado" });
    } else {
      await favoritosService.createFavorite(
        userID,
        tipo_objetivo,
        productoID,
        emprendimientoID
      );
      return res.status(201).json({ message: "Favorito agregado" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserFavoritesController(req, res) {
  try {
    const userID = req.user.id;
    const { tipo_objetivo } = req.query;

    const favoritos = await favoritosService.getFavoritesByUser(
      userID,
      tipo_objetivo
    );
    res.status(200).json(favoritos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
