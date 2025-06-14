import { body } from 'express-validator';
import { supabase } from '../config/config.js';

const categoriasPermitidasPrincipales = ['ropa', 'alimentos', 'comida', 'higiene', 'artesanías', 'librería', 'servicios'];

const categoriasSecundariasPorPrincipal = {
  ropa: ['Ropa de segunda mano', 'Vestidos', 'Accesorios', 'Calzado', 'Ropa variada', 'Otros'],
  alimentos: ['Frutas', 'Verduras', 'Lácteos', 'Productos enlatados', 'Snacks', 'Dulces típicos', 'Otros'],
  comida: ['Pizzas', 'Hamburguesas', 'Comida mexicana', 'Comida asiática', 'Postres', 'Carnes', 'Pescados y mariscos', 'Comida saludable', 'Hot Dogs', 'Cafetería', 'Otros'],
  higiene: ['Jabones', 'Shampoos', 'Productos dentales', 'Desodorantes', 'Productos femeninos', 'Otros'],
  artesanías: ['Cerámica', 'Tejidos', 'Joyería artesanal', 'Cuadros', 'Muebles', 'Otros'],
  librería: ['Libros infantiles', 'Novelas', 'Papelería', 'Material escolar', 'Revistas', 'Otros'],
  servicios: ['Reparación electrónica', 'Limpieza', 'Transporte', 'Consultoría', 'Educación', 'Otros']
};

const nombreUnico = async (valor) => {
  const { data, error } = await supabase
    .from('Comercio')
    .select('id')
    .ilike('nombre', valor)
    .limit(1);
  if (error) throw new Error('Error validando nombre');
  if (data && data.length > 0) throw new Error('El nombre del local ya existe');
  return true;
};

export const emprendimientoValidationRulesRegister = [
  body('nombre')
    .trim()
    .notEmpty()
    .isString()
    .isLength({ max: 100 })
    .custom(nombreUnico),

  body('descripcion')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 500 }),

  body('categoriasPrincipales')
    .isArray({ min: 1 })
    .custom((vals) => {
      const invalid = vals.filter(v => !categoriasPermitidasPrincipales.includes(v));
      if (invalid.length > 0) throw new Error(`Categorías principales no válidas: ${invalid.join(', ')}`);
      return true;
    }),

  body('categoriasSecundarias')
    .isArray({ min: 1 })
    .custom((vals, { req }) => {
      const principales = req.body.categoriasPrincipales;
      if (!Array.isArray(principales) || principales.length === 0) throw new Error('Debe especificar categorías principales antes de validar las secundarias');
      for (const principal of principales) {
        const invalid = vals.filter(sec => !categoriasSecundariasPorPrincipal[principal]?.includes(sec));
        if (invalid.length > 0) throw new Error(`Categorías secundarias no válidas para ${principal}: ${invalid.join(', ')}`);
      }
      return true;
    }),

  body('logo')
    .optional({ nullable: true })
    .isString()
    .isURL(),

  body('horarios_atencion')
    .optional({ nullable: true })
    .custom((valor) => {
      try {
        if (typeof valor === 'string') JSON.parse(valor);
        else if (typeof valor !== 'object') throw new Error();
        return true;
      } catch {
        throw new Error('Los horarios de atención deben ser un JSON válido');
      }
    }),

  body('direccion')
    .trim()
    .notEmpty()
    .isString()
    .isLength({ max: 200 }),

  body('telefono')
    .optional({ nullable: true })
    .custom((valor) => {
      if (!valor) return true;
      if (typeof valor !== 'string') throw new Error('El teléfono debe ser una cadena');
      if (!valor.match(/^\d{4}-\d{4}$/)) throw new Error('El teléfono debe tener el formato XXXX-XXXX');
      return true;
    }),

  body('redes_sociales')
    .optional({ nullable: true })
    .custom((valor) => {
      try {
        if (typeof valor === 'string') JSON.parse(valor);
        else if (typeof valor !== 'object') throw new Error();
        return true;
      } catch {
        throw new Error('Las redes sociales deben ser un JSON válido');
      }
    }),

  body('latitud')
    .notEmpty()
    .isFloat(),

  body('longitud')
    .notEmpty()
    .isFloat(),
];

export const emprendimientoValidationRulesUpdate = [
  body('nombre')
    .optional()
    .trim()
    .isString()
    .isLength({ max: 100 }),

  body('descripcion')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 500 }),

  body('categoriasPrincipales')
    .optional()
    .isArray({ min: 1 })
    .custom((vals) => {
      const invalid = vals.filter(v => !categoriasPermitidasPrincipales.includes(v));
      if (invalid.length > 0) throw new Error(`Categorías principales no válidas: ${invalid.join(', ')}`);
      return true;
    }),

  body('categoriasSecundarias')
    .optional()
    .isArray({ min: 1 })
    .custom((vals, { req }) => {
      const principales = req.body.categoriasPrincipales;
      if (!Array.isArray(principales) || principales.length === 0) throw new Error('Debe especificar categorías principales antes de validar las secundarias');
      for (const principal of principales) {
        const invalid = vals.filter(sec => !categoriasSecundariasPorPrincipal[principal]?.includes(sec));
        if (invalid.length > 0) throw new Error(`Categorías secundarias no válidas para ${principal}: ${invalid.join(', ')}`);
      }
      return true;
    }),

  body('logo')
    .optional({ nullable: true })
    .isString()
    .isURL(),

  body('horarios_atencion')
    .optional({ nullable: true })
    .custom((valor) => {
      try {
        if (typeof valor === 'string') JSON.parse(valor);
        else if (typeof valor !== 'object') throw new Error();
        return true;
      } catch {
        throw new Error('Los horarios de atención deben ser un JSON válido');
      }
    }),

  body('direccion')
    .optional()
    .trim()
    .isString()
    .isLength({ max: 200 }),

  body('telefono')
    .optional({ nullable: true })
    .custom((valor) => {
      if (!valor) return true;
      if (typeof valor !== 'string') throw new Error('El teléfono debe ser una cadena');
      if (!valor.match(/^\d{4}-\d{4}$/)) throw new Error('El teléfono debe tener el formato XXXX-XXXX');
      return true;
    }),

  body('redes_sociales')
    .optional({ nullable: true })
    .custom((valor) => {
      try {
        if (typeof valor === 'string') JSON.parse(valor);
        else if (typeof valor !== 'object') throw new Error();
        return true;
      } catch {
        throw new Error('Las redes sociales deben ser un JSON válido');
      }
    }),

  body('latitud')
    .optional()
    .isFloat(),

  body('longitud')
    .optional()
    .isFloat(),
];

export const searchByNombreValidationRules = [
  body('nombre')
    .trim()
    .notEmpty()
    .isString()
    .isLength({ max: 100 }),
];

export const searchByCategoriaValidationRules = [
  body('categoria')
    .trim()
    .notEmpty()
    .isString()
    .isLength({ max: 50 }),
];