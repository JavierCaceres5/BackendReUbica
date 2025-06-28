import express from "express";
import * as emprendimientoController from "../../controllers/emprendimiento.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";
import {
  emprendimientoValidationRulesRegister,
  emprendimientoValidationRulesUpdate,
  searchByNombreValidationRules,
  searchByCategoriaValidationRules,
} from "../../validators/emprendimiento.validators.js";
import validate from "../../middlewares/validation.middleware.js";
import upload from "../../middlewares/uploadImage.middleware.js";
import { parseArraysMiddleware } from "../../middlewares/parseArray.middleware.js";
import { uploadEmprendimientoImageToSupabase } from "../../middlewares/uploadImageSupabase.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "cliente", "emprendedor"),
  emprendimientoController.getEmprendimientosController
);

router.get(
  "/categoria",
  searchByCategoriaValidationRules,
  validate,
  emprendimientoController.getEmprendimientosByCategoriaController
);

router.get(
  "/nombre",
  authenticateToken,
  authorizeRoles("admin", "cliente", "emprendedor"),
  searchByNombreValidationRules,
  validate,
  emprendimientoController.searchEmprendimientosByNombreController
);

router.get(
  "/miEmprendimiento",
  authenticateToken,
  authorizeRoles("emprendedor"),
  emprendimientoController.getOwnEmprendimientoController
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  emprendimientoController.getEmprendimientoByIdController
);

router.post(
  "/registrarEmprendimiento",
  authenticateToken,
  authorizeRoles("admin", "cliente"),
  upload.single("logo"),
  uploadEmprendimientoImageToSupabase,
  parseArraysMiddleware,
  emprendimientoValidationRulesRegister,
  validate,
  emprendimientoController.createEmprendimientoController
);

router.put(
  "/actualizarEmprendimiento/:id",
  authenticateToken,
  authorizeRoles("admin"),
  upload.single("logo"),
  uploadEmprendimientoImageToSupabase,
  parseArraysMiddleware,
  emprendimientoValidationRulesUpdate,
  validate,
  emprendimientoController.updateEmprendimientoController
);

router.delete(
  "/deleteEmprendimiento/:id",
  authenticateToken,
  authorizeRoles("admin"),
  emprendimientoController.deleteEmprendimientoController
);

router.put(
  "/actualizarMiEmprendimiento",
  authenticateToken,
  authorizeRoles("emprendedor"),
  upload.single("logo"),
  uploadEmprendimientoImageToSupabase,
  parseArraysMiddleware,
  emprendimientoValidationRulesUpdate,
  validate,
  emprendimientoController.updateOwnEmprendimientoController
);

router.delete(
  "/eliminarMiEmprendimiento",
  authenticateToken,
  authorizeRoles("emprendedor"),
  emprendimientoController.deleteOwnEmprendimientoController
);

export default router;
