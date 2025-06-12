import { body } from 'express-validator';

export const userRegisterValidationRules = [
  body('email')
  .isEmail()
  .withMessage('Correo electrónico válido es requerido')
  .normalizeEmail()
  .trim(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe tener al menos una letra mayúscula')
    .matches(/\d/)
    .withMessage('La contraseña debe tener al menos un número')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .trim(),

  body('phone')
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('El número de teléfono debe estar en el formato XXXX-XXXX')
    .trim(),
];

export const userLoginValidationRules = [
  body('email')
  .isEmail()
  .withMessage('Correo electrónico válido es requerido')
  .trim(),

  body('password')
  .notEmpty()
  .withMessage('Contraseña es requerida')
  .trim(),
];

export const changePasswordValidationRules = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido.')
    .normalizeEmail()
    .trim(),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres.')
    .trim(),
    
  body('confirmNewPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Las contraseñas no coinciden.')
    .trim(),
];
