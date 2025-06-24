import express from "express";
import usersRoutes from "./Users/user.route.js";
import emprendimientoRoutes from "./Comercio/emprendimiento.route.js"
import productoRoutes from "./Comercio/producto.routes.js";
const router = express.Router();

router.use("/users", usersRoutes);
router.use("/emprendimientos", emprendimientoRoutes);
router.use("/productos", productoRoutes); 

export default router;