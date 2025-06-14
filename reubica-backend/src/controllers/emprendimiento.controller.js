import * as emprendimientoService from "../services/emprendimiento.service.js";
import { supabase } from "../config/config.js";
import { categoriasPermitidasPrincipales, categoriasSecundariasPorPrincipal } from "../utils/categorias.js";

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
      userID,
      latitud,
      longitud
    } = req.body;

    if (
      !nombre || 
      !descripcion || 
      !categoriasPrincipales || 
      !Array.isArray(categoriasPrincipales) || 
      categoriasPrincipales.length === 0 || 
      !direccion || 
      latitud === undefined || latitud === null ||
      longitud === undefined || longitud === null ||
      !userID
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const { data: existingEmprendimiento, error: existingError } = await supabase
      .from("Comercio")
      .select("*")
      .eq("nombre", nombre)
      .maybeSingle();

    if (existingEmprendimiento) {
      return res.status(400).json({ error: "El emprendimiento ya existe" });
    }
    if (existingError) throw existingError;

    const { data: newEmprendimiento, error: insertError } = await supabase
      .from("Comercio")
      .insert({
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
        longitud
      })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({
      message: "Emprendimiento creado exitosamente",
      emprendimiento: newEmprendimiento
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateEmprendimientoController(req, res) {
  try {
    const emprendimientoId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;
    const updateData = req.body;

    const emprendimiento = await emprendimientoService.getEmprendimientoById(emprendimientoId);
    if (!emprendimiento) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    if (emprendimiento.userID !== userId && role !== "admin") {
      return res.status(403).json({ error: "No autorizado para actualizar este emprendimiento" });
    }

    const categoriasPermitidasPrincipales = [
      "Comida",
      "Alimentos",
      "Higiene",
      "Servicios",
      "Ropa",
      "Libreria",
      "Artesanias"
    ];

    if (updateData.categoriasPrincipales) {
      if (
        !Array.isArray(updateData.categoriasPrincipales) ||
        !updateData.categoriasPrincipales.every((cat) =>
          categoriasPermitidasPrincipales.includes(cat)
        )
      ) {
        return res.status(400).json({ error: "Categorías principales inválidas" });
      }
    }

    const camposActualizables = [
      "nombre",
      "descripcion",
      "categoriasPrincipales",
      "categoriasSecundarias",
      "logo",
      "horarios_atencion",
      "direccion",
      "telefono",
      "redes_sociales",
      "latitud",
      "longitud",
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
      return res.status(400).json({ error: "Debe proporcionar una categoría principal" });
    }

    if (!categoriasPermitidasPrincipales.includes(categoria)) {
      return res.status(400).json({ error: "Categoría principal no válida" });
    }

    const emprendimientos = await emprendimientoService.getEmprendimientosByCategoriaPrincipal(categoria);
    res.json(emprendimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}