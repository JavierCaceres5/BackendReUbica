import express from "express";
<<<<<<< HEAD
import usersRoutes from "./user.route.js";
import emprendimientoRoutes from "./emprendimiento.route.js"

const router = express.Router();

router.use("/users", usersRoutes);
router.use("/emprendimientos", emprendimientoRoutes)
=======
import usersRoutes from "./Users/user.route.js";
import emprendimientoRoutes from "./Comercio/emprendimiento.route.js"
import productoRoutes from "./Comercio/producto.routes.js";
const router = express.Router();

router.use("/users", usersRoutes);
router.use("/emprendimientos", emprendimientoRoutes);
router.use("/productos", productoRoutes); 
>>>>>>> 08fec6dbe676c4972943ee658ae9e00c4132a5eb

export default router;