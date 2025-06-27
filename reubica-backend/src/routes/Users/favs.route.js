import express from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validation.middleware.js";
import {
  toggleFavoriteValidator,
  favoritesListValidation,
} from "../../validators/favs.validators.js";
import {
  toggleFavoriteController,
  getUserFavoritesController,
} from "../../controllers/favs.controller.js";

const router = express.Router();

// Agregar o eliminar favorito mediante toggle
router.post(
  "/toggle",
  authenticateToken,
  toggleFavoriteValidator,
  validate,
  toggleFavoriteController
);

// Obtener todos los favoritos del usuario
router.get(
  "/",
  authenticateToken,
  favoritesListValidation,
  validate,
  getUserFavoritesController
);

export default router;