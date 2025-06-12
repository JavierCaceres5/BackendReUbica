import express from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import usersRoutes from './user.route.js';
const router = express.Router();

router.use('/users', usersRoutes);

export default router;