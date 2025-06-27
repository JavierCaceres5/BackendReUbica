import { body, query } from "express-validator";
import { supabase } from "../config/config.js";

export const toggleFavoriteValidator = [
  body("tipo_objetivo")
    .notEmpty()
    .withMessage("El tipo_objetivo es requerido")
    .isIn(["producto", "emprendimiento"])
    .withMessage("tipo_objetivo debe ser 'producto' o 'emprendimiento'"),

  body("productoID")
    .if(body("tipo_objetivo").equals("producto"))
    .notEmpty()
    .withMessage("productoID es requerido para tipo_objetivo 'producto'")
    .bail()
    .custom(async (valor) => {
      const { data, error } = await supabase
        .from("Productos")
        .select("id")
        .eq("id", valor)
        .maybeSingle();
      if (error) throw new Error("Error validando producto");
      if (!data) throw new Error("El producto no existe");
      return true;
    }),

  body("emprendimientoID")
    .if(body("tipo_objetivo").equals("emprendimiento"))
    .notEmpty()
    .withMessage(
      "emprendimientoID es requerido para tipo_objetivo 'emprendimiento'"
    )
    .bail()
    .custom(async (valor) => {
      const { data, error } = await supabase
        .from("Comercio")
        .select("id")
        .eq("id", valor)
        .maybeSingle();
      if (error) throw new Error("Error validando emprendimiento");
      if (!data) throw new Error("El emprendimiento no existe");
      return true;
    }),

  body().custom((value) => {
    const { tipo_objetivo, productoID, emprendimientoID } = value;
    if (tipo_objetivo === "producto" && emprendimientoID) {
      throw new Error(
        "No debes enviar emprendimientoID cuando tipo_objetivo es 'producto'"
      );
    }
    if (tipo_objetivo === "emprendimiento" && productoID) {
      throw new Error(
        "No debes enviar productoID cuando tipo_objetivo es 'emprendimiento'"
      );
    }
    return true;
  }),
];

export const favoritesListValidation = [
  query("tipo_objetivo")
    .optional()
    .isIn(["producto", "emprendimiento"])
    .withMessage("tipo_objetivo debe ser 'producto' o 'emprendimiento'"),
];
