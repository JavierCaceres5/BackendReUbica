import { body, query } from "express-validator";
import { supabase } from "../config/config.js";

export const nombreProductoUnico = async (nombre, { req }) => {
  const userID = req.user.id;

  const { data: comercio, error: comercioError } = await supabase
    .from("Comercio")
    .select("id")
    .eq("userID", userID)
    .maybeSingle();

  if (comercioError) throw new Error("Error validando comercio");
  if (!comercio) throw new Error("No tienes un emprendimiento registrado");

  const { data: productoExistente, error } = await supabase
    .from("Productos")
    .select("id")
    .eq("nombre", nombre)
    .eq("emprendimientoID", comercio.id)
    .maybeSingle();

  if (error) throw new Error("Error validando nombre del producto");
  if (productoExistente)
    throw new Error(
      "Ya existe un producto con ese nombre en tu emprendimiento"
    );

  return true;
};

export const productoValidationRulesRegister = [
  body("nombre")
    .trim()
    .notEmpty()
    .isString()
    .isLength({ max: 100 })
    .custom(nombreProductoUnico),

  body("descripcion").trim().notEmpty().isString().isLength({ max: 500 }),

  body("precio")
    .notEmpty()
    .withMessage("El precio es obligatorio")
    .isFloat({ gt: 0 })
    .withMessage("El precio debe ser mayor a 0"),

  body("product_image")
    .optional({ nullable: true })
    .isString()
    .withMessage("La URL de imagen del producto es requerida")
    .isURL()
    .withMessage("Debe ser una URL válida"),
];

export const productoValidationRulesUpdate = [
  body("nombre").optional().trim().isString().isLength({ max: 100 }),

  body("descripcion").optional().trim().isString().isLength({ max: 500 }),

  body("precio")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("El precio debe ser mayor a 0"),

  body("product_image")
    .optional()
    .isString()
    .isURL()
    .withMessage("Debe ser una URL válida"),
];

export const searchProductoByNombreValidationRules = [
  query("nombre").trim().notEmpty().isString().isLength({ max: 100 }),
];
