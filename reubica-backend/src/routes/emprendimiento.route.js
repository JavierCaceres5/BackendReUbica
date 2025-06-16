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
  "/registerEmprendimiento",
  authenticateToken,  
  upload.single("logo"),
  uploadEmprendimientoImageToSupabase,
  parseArraysMiddleware,
  emprendimientoValidationRulesRegister,
  validate,
  emprendimientoController.createEmprendimientoController
);

router.put(
  "/:id",
  authenticateToken,
  upload.single("user_icon"),
  uploadEmprendimientoImageToSupabase,
  emprendimientoValidationRulesUpdate,
  emprendimientoController.updateEmprendimientoController
);

router.delete(
  "/:id",
  authenticateToken,
  emprendimientoController.deleteEmprendimientoController
);



export default router;