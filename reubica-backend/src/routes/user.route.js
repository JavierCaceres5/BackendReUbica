import express from "express";
import * as usersController from "../controllers/user.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
  userRegisterValidationRules,
  userLoginValidationRules,
  changePasswordValidationRules,
} from "../validators/user.validators.js";
import validate from "../middlewares/validation.middleware.js";
import upload from "../middlewares/uploadImage.middleware.js";
import { uploadUserImageToSupabase } from "../middlewares/uploadImageSupabase.middleware.js";
const router = express.Router();

// Registro de usuario
router.post(
  "/register",
  upload.single("user_icon"),
  uploadUserImageToSupabase,
  userRegisterValidationRules,
  validate,
  usersController.registerUser
);
//Log in de usuario
router.post(
  "/login",
  userLoginValidationRules,
  validate,
  usersController.login
);
// Admin puede ver todos los usuarios
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  usersController.getUsers
);
// Usuario loggeado puede ver su propio perfil
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "cliente", "emprendedor"),
  usersController.getUserById
);
// Admin puede editar cualquier usuario, usuario loggeado solo el suyo
router.put(
  "/updateProfile/:id",
  authenticateToken,
  authorizeRoles("admin", "cliente", "emprendedor"),
  upload.single("user_icon"),
  uploadUserImageToSupabase,
  usersController.updateUser
);
// Solo admin puede eliminar usuarios
router.delete(
  "/deleteProfile/:id",
  authenticateToken,
  authorizeRoles("admin", "cliente", "emprendedor"),
  usersController.deleteUser
);

router.delete(
  '/deleteProfile',
   authenticateToken,
    authorizeRoles('cliente', 'emprendedor'),
     usersController.deleteOwnUserController
);

router.put(
  '/updateProfile',
  authenticateToken,
  authorizeRoles('cliente', 'emprendedor'),
  usersController.updateOwnUserController
);

//router.post('/logout', authenticateToken, usersController.logout);

export default router;