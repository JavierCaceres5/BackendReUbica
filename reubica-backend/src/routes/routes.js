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
import productoRoutes from "./Comercio/Producto/producto.routes.js";
import favoritosRoutes from "./Users/favs.route.js";

const router = express.Router();

router.use("/users", usersRoutes);
router.use("/emprendimientos", emprendimientoRoutes);
router.use("/productos", productoRoutes); 
<<<<<<< HEAD
>>>>>>> 08fec6dbe676c4972943ee658ae9e00c4132a5eb
=======
router.use("/favoritos", favoritosRoutes);


>>>>>>> 89827795649571d12114a25bff03966ac7f74f51

export default router;