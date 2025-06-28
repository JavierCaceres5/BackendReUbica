import express from "express";
import * as productoController from "../../controllers/producto.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validation.middleware.js";
import upload from "../../middlewares/uploadImage.middleware.js";
import { uploadProductImageToSupabase } from "../../middlewares/uploadImageSupabase.middleware.js";
import {
  productoValidationRulesRegister,
  productoValidationRulesUpdate,
  searchProductoByNombreValidationRules,
} from "../../validators/producto.validators.js";

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

export default router;
