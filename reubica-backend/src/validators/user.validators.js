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

  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Las contraseñas no coinciden')
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

export const sendResetCodeValidation = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido.')
    .normalizeEmail()
    .trim(),
];

export const resetPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido.')
    .normalizeEmail()
    .trim(),

  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('El código debe tener 6 dígitos.')
    .isNumeric()
    .withMessage('El código debe contener solo números.')
    .trim(),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe tener al menos una letra mayúscula.')
    .matches(/\d/)
    .withMessage('La contraseña debe tener al menos un número.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('La contraseña debe tener al menos un carácter especial.')
    .trim(),

  body('confirmNewPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Las contraseñas no coinciden.')
    .trim(),
];

