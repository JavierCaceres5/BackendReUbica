import { body } from "express-validator";
import { supabase } from "../config/config.js";

export const createRatingValidator = [
  body("productoID")
    .notEmpty()
    .withMessage("productoID es requerido")
    .bail()
    .isUUID()
    .withMessage("productoID debe ser un UUID válido")
    .bail()
    .custom(async (productoID) => {
      const { data, error } = await supabase
        .from("Productos")
        .select("id")
        .eq("id", productoID)
        .maybeSingle();
      if (error) throw new Error("Error validando producto");
      if (!data) throw new Error("El producto no existe");
      return true;
    }),

  body("comentario")
    .optional()
    .isString()
    .withMessage("El comentario debe ser texto"),

  body("rating")
    .notEmpty()
    .withMessage("rating es requerido")
    .bail()
    .isFloat({ min: 1, max: 5 })
    .withMessage("rating debe estar entre 1.0 y 5.0"),
];

export const deleteRatingValidator = [
  body("productoID")
    .notEmpty()
    .withMessage("productoID es requerido")
    .bail()
    .isUUID()
    .withMessage("productoID debe ser un UUID válido")
];
