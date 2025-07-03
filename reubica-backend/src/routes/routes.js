import express from "express";
import usersRoutes from "./Users/user.route.js";
import emprendimientoRoutes from "./Comercio/emprendimiento.route.js";
import productoRoutes from "./Comercio/Producto/producto.routes.js"
import favoritosRoutes from "./Users/favs.route.js";

const router = express.Router();

router.use("/users", usersRoutes);
router.use("/emprendimientos", emprendimientoRoutes);
router.use("/productos", productoRoutes); 

router.use("/favoritos", favoritosRoutes);



export default router;