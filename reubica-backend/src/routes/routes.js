import express from "express";
import usersRoutes from "./user.route.js";
import emprendimientoRoutes from "./emprendimiento.route.js"

const router = express.Router();

router.use("/users", usersRoutes);
router.use("/emprendimientos", emprendimientoRoutes)

export default router;