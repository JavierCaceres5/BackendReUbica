import express from "express";
import { authenticateToken } from "../../../middlewares/auth.middleware.js";
import validate from "../../../middlewares/validation.middleware.js";
import {
  createRatingValidator,
  deleteRatingValidator,
} from "../../../validators/ratings.validators.js";
import {
  createRatingController,
  deleteRatingController,
} from "../../../controllers/ratings.controller.js";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  createRatingValidator,
  validate,
  createRatingController
);

// Eliminar la valoración del usuario sobre un producto
router.delete(
  "/",
  authenticateToken,
  deleteRatingValidator,
  validate,
  deleteRatingController
);

export default router;
