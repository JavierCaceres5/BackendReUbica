import express from 'express';
import * as usersController from '../controllers/user.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
const router = express.Router();
router.get('/', authenticateToken, authorizeRoles('admin'), usersController.getUsers);


router.get('/:id', authenticateToken, authorizeRoles('admin'), usersController.getUser);
router.post('/register', usersController.createUser);

//router.put('/:id', authenticateToken, authorizeRoles('admin', 'user'), upload.single('avatar'), usersController.updateUser);
// Admin puede editar cualquier usuario, user solo el suyo (de nuevo, verificar en controlador)

router.delete('/:id', authenticateToken, authorizeRoles('admin'), usersController.deleteUser);
// Solo admin puede eliminar usuarios
router.post('/login', usersController.login);

//router.post('/logout', authenticateToken, usersController.logout);


export default router;