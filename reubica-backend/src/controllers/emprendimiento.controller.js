import * as emprendimientoService from "../services/emprendimiento.service.js";

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

function validarCategorias(categoriasPrincipales, categoriasSecundarias) {
  const principalesLower = categoriasPrincipales.map(cat => cat.toLowerCase());
  for (const secundaria of categoriasSecundarias) {
    const secundariaLower = secundaria.toLowerCase();
    const pertenece = principalesLower.some(principal => {
      const permitidasSecundarias = categoriasSecundariasPorPrincipal[principal] || [];
      return permitidasSecundarias.some(sec => sec.toLowerCase() === secundariaLower);
    });
    if (!pertenece) {
      return {
        valido: false,
        mensaje: `La categoría secundaria '${secundaria}' no corresponde a ninguna categoría principal seleccionada.`
      };
    }
  }
  return { valido: true };
}

export async function getEmprendimientosController(req, res) {
  try {
    const emprendimientos = await emprendimientoService.getAllEmprendimientos();
    res.json(emprendimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getEmprendimientoByIdController(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado, solo admins' });
    }
    const id = req.params.id;
    const emprendimiento = await emprendimientoService.getEmprendimientoById(id);
    if (!emprendimiento) {
      return res.status(404).json({ error: 'Comercio no encontrado' });
    }
    res.status(200).json(emprendimiento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createEmprendimientoController(req, res) {
  try {
    const userID = req.user.id;
    const {
      nombre,
      descripcion,
      categoriasPrincipales,
      categoriasSecundarias,
      logo,
      horarios_atencion,
      direccion,
      telefono,
      redes_sociales,
      latitud,
      longitud,
    } = req.body;

    if (
      !nombre ||
      !descripcion ||
      !categoriasPrincipales ||
      !Array.isArray(categoriasPrincipales) ||
      categoriasPrincipales.length === 0 ||
      !categoriasPrincipales.every(cat => categoriasPermitidasPrincipales.includes(cat.toLowerCase())) ||
      !categoriasSecundarias ||
      !Array.isArray(categoriasSecundarias) ||
      !logo ||
      !direccion ||
      latitud === undefined || latitud === null ||
      longitud === undefined || longitud === null ||
      !userID
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios o categorías inválidas" });
    }

    const validacionCategorias = validarCategorias(categoriasPrincipales, categoriasSecundarias || []);
    if (!validacionCategorias.valido) {
      return res.status(400).json({ error: validacionCategorias.mensaje });
    }

    const emprendimiento = {
      nombre,
      descripcion,
      categoriasPrincipales,
      categoriasSecundarias,
      logo,
      horarios_atencion: horarios_atencion || null,
      direccion,
      telefono: telefono || null,
      redes_sociales: redes_sociales || null,
      userID,
      latitud,
      longitud,
    };

    const nuevoEmprendimiento = await emprendimientoService.createEmprendimiento(emprendimiento);

    res.status(201).json({
      message: "Emprendimiento creado exitosamente",
      emprendimiento: nuevoEmprendimiento,
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
    console.log("Datos recibidos para crear emprendimiento:", req.body);
}

export async function updateEmprendimientoController(req, res) {
  try {
    const emprendimientoId = req.params.id;
    const userId = req.user.id;
    const updateData = req.body;

    const emprendimiento = await emprendimientoService.getEmprendimientoById(emprendimientoId);
    if (!emprendimiento) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    if (emprendimiento.userID !== userId) {
      return res.status(403).json({ error: "No autorizado para actualizar este emprendimiento" });
    }

    if (updateData.categoriasPrincipales) {
      if (!Array.isArray(updateData.categoriasPrincipales) || 
          !updateData.categoriasPrincipales.every(cat => categoriasPermitidasPrincipales.includes(cat.toLowerCase()))
      ) {
        return res.status(400).json({ error: "Categorías principales inválidas" });
      }
    }

    if (updateData.categoriasSecundarias) {
      const categoriasPrincipalesParaValidar = updateData.categoriasPrincipales || emprendimiento.categoriasPrincipales;
      const validacionCategorias = validarCategorias(categoriasPrincipalesParaValidar, updateData.categoriasSecundarias);
      if (!validacionCategorias.valido) {
        return res.status(400).json({ error: validacionCategorias.mensaje });
      }
    }

    const camposActualizables = [
      'nombre',
      'descripcion',
      'categoriasPrincipales',
      'categoriasSecundarias',
      'logo',
      'horarios_atencion',
      'direccion',
      'telefono',
      'redes_sociales',
      'latitud',
      'longitud'
    ];

    const emprendimientoActualizado = {};
    for (const field of camposActualizables) {
      if (field in updateData) {
        emprendimientoActualizado[field] = updateData[field];
      }
    }

    if (Object.keys(emprendimientoActualizado).length === 0) {
      return res.status(400).json({ error: "No se enviaron datos válidos para actualizar" });
    }

    const updated = await emprendimientoService.updateEmprendimiento(emprendimientoId, emprendimientoActualizado);

    res.status(200).json({ message: "Emprendimiento actualizado exitosamente", emprendimiento: updated });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function deleteEmprendimientoController(req, res) {
  try {
    const emprendimientoId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const emprendimiento = await emprendimientoService.getEmprendimientoById(emprendimientoId);
    if (!emprendimiento) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    if (emprendimiento.userID !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: "No autorizado para eliminar este emprendimiento" });
    }

    await emprendimientoService.deleteEmprendimiento(emprendimientoId);

    res.status(200).json({ message: "Emprendimiento eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function searchEmprendimientosByNombreController(req, res) {
  try {
    const { nombre } = req.query;

    if (!nombre) {
      return res.status(400).json({ error: "El parámetro 'nombre' es requerido" });
    }

    const resultados = await emprendimientoService.searchEmprendimientosByNombre(nombre);

    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function getEmprendimientosByCategoriaController(req, res) {
  try {
    const { categoria } = req.query;

    if (!categoria) {
      return res.status(400).json({ error: "El parámetro 'categoria' es requerido" });
    }

    const resultados = await emprendimientoService.getEmprendimientosByCategoria(categoria);

    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}