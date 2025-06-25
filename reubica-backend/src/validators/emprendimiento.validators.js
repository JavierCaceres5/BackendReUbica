import { body, query } from "express-validator";
import { supabase } from "../config/config.js";
import {
  categoriasPermitidasPrincipales,
  categoriasSecundariasPorPrincipal,
} from "../utils/categorias.js";
import { redesSociales } from "../utils/redesSociales.js";

const nombreUnico = async (valor) => {
  const { data, error } = await supabase
    .from("Comercio")
    .select("id")
    .ilike("nombre", valor)
    .limit(1);
  if (error) throw new Error("Error validando nombre");
  if (data && data.length > 0) throw new Error("El nombre del local ya existe");
  return true;
};

const validarRedesSociales = (valor) => {
  if (!valor || valor === "") return true; 

  let parsed = valor;
  if (typeof valor === "string") {
    try {
      parsed = JSON.parse(valor);
    } catch {
      throw new Error("Las redes sociales deben ser un JSON válido");
    }
  }

  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Las redes sociales deben ser un objeto JSON válido");
  }

  for (const key of Object.keys(parsed)) {
    if (!redesSociales.includes(key)) {
      throw new Error(`Red social no permitida: ${key}`);
    }

    const val = parsed[key];
    const cleanVal = typeof val === "string" ? val.trim() : val;
    if (cleanVal !== "" && cleanVal !== null && typeof cleanVal !== "string") {
      throw new Error(`El valor de ${key} debe ser un string o vacío`);
    }
  }

  return true;
};

export const emprendimientoValidationRulesRegister = [
  body("nombre")
    .trim()
    .notEmpty()
    .isString()
    .isLength({ max: 100 })
    .custom(nombreUnico),

  body("descripcion").notEmpty().isString().isLength({ max: 500 }),

  body("categoriasPrincipales")
    .notEmpty()
    .isArray({ min: 1 })
    .custom((vals) => {
      const invalid = vals.filter(
        (v) => !categoriasPermitidasPrincipales.includes(v)
      );
      if (invalid.length > 0)
        throw new Error(
          `Categorías principales no válidas: ${invalid.join(", ")}`
        );
      return true;
    }),

  body("categoriasSecundarias")
    .notEmpty()
    .isArray({ min: 1 })
    .custom((vals, { req }) => {
      const principales = req.body.categoriasPrincipales;
      if (!Array.isArray(principales) || principales.length === 0)
        throw new Error(
          "Debe especificar categorías principales antes de validar las secundarias"
        );
      for (const principal of principales) {
        const invalid = vals.filter(
          (sec) => !categoriasSecundariasPorPrincipal[principal]?.includes(sec)
        );
        if (invalid.length > 0)
          throw new Error(
            `Categorías secundarias no válidas para ${principal}: ${invalid.join(
              ", "
            )}`
          );
      }
      return true;
    }),

  body("logo").optional(),

  body("direccion").trim().notEmpty().isString().isLength({ max: 200 }),

  body("emprendimientoPhone")
    .notEmpty()
    .custom((valor) => {
      if (typeof valor !== "string" || valor.trim() === "") {
        throw new Error("El teléfono no puede estar vacío");
      }
      if (!valor.match(/^\d{4}-\d{4}$/)) {
        throw new Error("El teléfono debe tener el formato XXXX-XXXX");
      }
      return true;
    }),

  body("redes_sociales").optional().custom(validarRedesSociales),

  body("latitud").notEmpty().isFloat(),

  body("longitud").notEmpty().isFloat(),
];

export const emprendimientoValidationRulesUpdate = [
  body("nombre").optional().trim().isString().isLength({ max: 100 }),

  body("descripcion").optional().isString().isLength({ max: 500 }),

  body("categoriasPrincipales")
    .optional()
    .isArray({ min: 1 })
    .custom((vals) => {
      const invalid = vals.filter(
        (v) => !categoriasPermitidasPrincipales.includes(v)
      );
      if (invalid.length > 0)
        throw new Error(
          `Categorías principales no válidas: ${invalid.join(", ")}`
        );
      return true;
    }),

  body("categoriasSecundarias")
    .optional()
    .isArray({ min: 1 })
    .custom((vals, { req }) => {
      const principales = req.body.categoriasPrincipales;
      if (!Array.isArray(principales) || principales.length === 0)
        throw new Error("Debe especificar categorías principales");

      for (const principal of principales) {
        const secundariasValidas =
          categoriasSecundariasPorPrincipal[principal] || [];
        const invalid = vals.filter((sec) => !secundariasValidas.includes(sec));
        if (invalid.length > 0) {
          throw new Error(
            `Categorías secundarias inválidas para ${principal}: ${invalid.join(
              ", "
            )}`
          );
        }
      }
      return true;
    }),

  body("logo").optional(), // <-- corregido también aquí

  body("direccion").optional().trim().isString().isLength({ max: 200 }),

  body("emprendimientoPhone")
    .optional()
    .custom((valor) => {
      if (typeof valor !== "string" || valor.trim() === "") {
        throw new Error("El teléfono no puede estar vacío");
      }
      if (!valor.match(/^\d{4}-\d{4}$/)) {
        throw new Error("El teléfono debe tener el formato XXXX-XXXX");
      }
      return true;
    }),

  body("redes_sociales").optional().custom(validarRedesSociales),

  body("latitud").optional().isFloat(),

  body("longitud").optional().isFloat(),
];

export const searchByNombreValidationRules = [
  query("nombre").trim().notEmpty().isString().isLength({ max: 100 }),
];

export const searchByCategoriaValidationRules = [
  query("categoria")
    .trim()
    .notEmpty()
    .withMessage("La categoría es requerida")
    .isString()
    .withMessage("La categoría debe ser un texto")
    .custom((value) => {
      if (!categoriasPermitidasPrincipales.includes(value)) {
        throw new Error("Categoría principal no válida");
      }
      return true;
    }),
];
