import express from "express";
import usersRoutes from "./user.route.js";
const router = express.Router();

router.use("/users", usersRoutes);

export default router;
