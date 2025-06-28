import { param, body } from "express-validator";

export const createRatingValidator = [
  param("productoID")
    .notEmpty()
    .isUUID()
    .withMessage("productoID inválido"),

  body("comentario")
    .optional()
    .isString()
    .withMessage("El comentario debe ser texto"),

  body("rating")
    .notEmpty()
    .isFloat({ min: 1, max: 5 })
    .withMessage("rating debe estar entre 1 y 5")
];

export const deleteRatingValidator = [
  param("productoID")
    .notEmpty()
    .isUUID()
    .withMessage("productoID es requerido o inválido")
];

