import express from "express";
import * as emprendimientoController from "../controllers/emprendimiento.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
  emprendimientoValidationRulesRegister,
  emprendimientoValidationRulesUpdate,
  searchByNombreValidationRules,
  searchByCategoriaValidationRules,
} from "../validators/emprendimiento.validators.js";
import validate from "../middlewares/validation.middleware.js";
import upload from "../middlewares/uploadImage.middleware.js";
import { parseArraysMiddleware } from "../middlewares/parseArray.middleware.js";
import { uploadEmprendimientoImageToSupabase } from "../middlewares/uploadImageSupabase.middleware.js";

const router = express.Router();

router.get("/", emprendimientoController.getEmprendimientosController);

router.get(
  "/categoria",
  searchByCategoriaValidationRules,
  validate,
  emprendimientoController.getEmprendimientosByCategoriaController
);

router.get(
  "/nombre",
  searchByNombreValidationRules,
  validate,
  emprendimientoController.searchEmprendimientosByNombreController
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
  authorizeRoles("admin", "emprendedor"),
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
  authorizeRoles("admin", "emprendedor"),
  emprendimientoController.deleteEmprendimientoController
);

export default router;
