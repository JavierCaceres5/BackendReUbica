import express from "express";
import * as productoController from "../../../controllers/producto.controller.js";
import * as ratingController from "../../../controllers/ratings.controller.js"
import {
  authenticateToken,
  authorizeRoles,
} from "../../../middlewares/auth.middleware.js";
import validate from "../../../middlewares/validation.middleware.js";
import upload from "../../../middlewares/uploadImage.middleware.js";
import { uploadProductImageToSupabase } from "../../../middlewares/uploadImageSupabase.middleware.js";
import {
  productoValidationRulesRegister,
  productoValidationRulesUpdate,
  searchProductoByNombreValidationRules,
} from "../../../validators/producto.validators.js";
import { createRatingValidator, deleteRatingValidator } from "../../../validators/ratings.validators.js"

const router = express.Router();

// Obtener todos los productos
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "cliente", "emprendedor"),
  productoController.getProductosController
);

// Buscar por nombre
router.get(
  "/nombre",
  authenticateToken,
  authorizeRoles("admin", "cliente", "emprendedor"),
  searchProductoByNombreValidationRules,
  validate,
  productoController.searchProductosByNombreController
);

// Obtener productos por emprendimientoID
router.get(
  "/emprendimiento/:id",
  authenticateToken,
  authorizeRoles("admin", "cliente", "emprendedor"),
  productoController.getProductosByEmprendimientoController
);

router.get(
  "/emprendimiento/:id/ratings",
  authenticateToken,
  authorizeRoles("admin", "emprendedor", "cliente"),
  ratingController.getRatingsByEmprendimientoController
);

// Obtener por ID
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  productoController.getProductoByIdController
);

// Crear producto
router.post(
  "/registrarProducto",
  authenticateToken,
  authorizeRoles("emprendedor", "admin"),
  upload.single("product_image"),
  uploadProductImageToSupabase,
  productoValidationRulesRegister,
  validate,
  productoController.createProductoController
);

// Actualizar producto
router.put(
  "/actualizarProducto/:id",
  authenticateToken,
  authorizeRoles("emprendedor", "admin"),
  upload.single("product_image"),
  uploadProductImageToSupabase,
  productoValidationRulesUpdate,
  validate,
  productoController.updateProductoController
);

// Eliminar producto
router.delete(
  "/eliminarProducto/:id",
  authenticateToken,
  authorizeRoles("emprendedor", "admin"),
  productoController.deleteProductoController
);

// Crear una valoración para un producto
router.post(
  "/:productoID/ratings",
  authenticateToken,
  authorizeRoles("cliente", "emprendedor", "admin"), 
  createRatingValidator,
  validate,
  ratingController.createRatingController
);

// Eliminar la valoración del usuario actual para un producto
router.delete(
  "/:productoID/ratings",
  authenticateToken,
  authorizeRoles("cliente", "emprendedor", "admin"),
  deleteRatingValidator,
  validate,
  ratingController.deleteRatingController
);

export default router;
