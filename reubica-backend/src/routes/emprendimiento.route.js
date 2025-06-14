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
import upload from "../middlewares/uploadImage.middleware.js";
import uploadImageToSupabase from "../middlewares/uploadImageSupabase.middleware.js";

const router = express.Router();

router.get("/", emprendimientoController.getEmprendimientosController);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  emprendimientoController.getEmprendimientoByIdController
);

router.post(
  "/",
  authenticateToken,
  upload.single("user_icon"),
  uploadImageToSupabase,
  emprendimientoValidationRulesRegister,
  emprendimientoController.createEmprendimientoController
);

router.put(
  "/:id",
  authenticateToken,
  upload.single("user_icon"),
  uploadImageToSupabase,
  emprendimientoValidationRulesUpdate,
  emprendimientoController.updateEmprendimientoController
);

router.delete(
  "/:id",
  authenticateToken,
  emprendimientoController.deleteEmprendimientoController
);

router.get(
  "/search",
  searchByNombreValidationRules,
  emprendimientoController.searchEmprendimientosByNombreController
);

router.get(
  "/categoria",
  searchByCategoriaValidationRules,
  emprendimientoController.getEmprendimientosByCategoriaController
);

export default router;