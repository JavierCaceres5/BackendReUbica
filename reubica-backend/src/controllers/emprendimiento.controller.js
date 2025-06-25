import * as emprendimientoService from "../services/emprendimiento.service.js";
import { supabase } from "../config/config.js";
import {
  categoriasPermitidasPrincipales,
  categoriasSecundariasPorPrincipal,
} from "../utils/categorias.js";

// Obtener todos los emprendimientos
export async function getEmprendimientosController(req, res) {
  try {
    const emprendimientos = await emprendimientoService.getAllEmprendimientos();
    res.json(emprendimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener emprendimiento por ID
export async function getEmprendimientoByIdController(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado, solo admins" });
    }
    const id = req.params.id;
    const emprendimiento = await emprendimientoService.getEmprendimientoById(
      id
    );
    if (!emprendimiento) {
      return res.status(404).json({ error: "Comercio no encontrado" });
    }
    res.status(200).json(emprendimiento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Crear un nuevo emprendimiento
export async function createEmprendimientoController(req, res) {
  try {
    const {
      nombre,
      descripcion,
      categoriasPrincipales,
      categoriasSecundarias,
      logo,
      direccion,
      emprendimientoPhone,
      redes_sociales,
      latitud,
      longitud,
    } = req.body;

    const userID = req.user.id;
    const userRole = req.user.role;

    if (
      !nombre ||
      !descripcion ||
      !categoriasPrincipales ||
      !Array.isArray(categoriasPrincipales) ||
      categoriasPrincipales.length === 0 ||
      !direccion ||
      latitud === undefined ||
      latitud === null ||
      longitud === undefined ||
      longitud === null
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Validar si ya existe un emprendimiento para este usuario (excepto si es admin)
    if (userRole !== "admin") {
      const { data: existingByUser, error: errorByUser } = await supabase
        .from("Comercio")
        .select("*")
        .eq("userID", userID)
        .maybeSingle();

      if (existingByUser) {
        return res
          .status(400)
          .json({ error: "Ya tiene un emprendimiento registrado" });
      }
      if (errorByUser) throw errorByUser;
    }

    // Validar si ya existe un emprendimiento con el mismo nombre
    const { data: existingByName, error: errorByName } = await supabase
      .from("Comercio")
      .select("*")
      .eq("nombre", nombre)
      .maybeSingle();

    if (existingByName) {
      return res
        .status(400)
        .json({ error: "Ya existe un emprendimiento con ese nombre" });
    }
    if (errorByName) throw errorByName;

    const logoFinal = req.emprendimientoLogoUrl || logo || null;

    const newEmprendimiento = await emprendimientoService.createEmprendimiento({
      nombre,
      descripcion,
      categoriasPrincipales,
      categoriasSecundarias,
      logo: logoFinal,
      direccion,
      emprendimientoPhone: emprendimientoPhone || null,
      redes_sociales: redes_sociales || null,
      userID,
      latitud,
      longitud,
    });

    // Solo cambiar el rol si es un cliente creando su propio emprendimiento
    if (userRole === "cliente") {
      const { error: roleUpdateError } = await supabase
        .from("users")
        .update({ user_role: "emprendedor" })
        .eq("id", userID);

      if (roleUpdateError) throw roleUpdateError;
    }

    res.status(201).json({
      message: "Emprendimiento creado exitosamente",
      emprendimiento: newEmprendimiento,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Actualizar emprendimiento
export async function updateEmprendimientoController(req, res) {
  try {
    const emprendimientoId = req.params.id;
    const userIdFromToken = req.user.id;
    const userRole = req.user.role;

    const emprendimiento = await emprendimientoService.getEmprendimientoById(emprendimientoId);
    if (!emprendimiento) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    if (userRole !== "admin" && emprendimiento.userID !== userIdFromToken) {
      return res.status(403).json({ error: "No autorizado para actualizar este emprendimiento" });
    }

    const {
      nombre,
      descripcion,
      categoriasPrincipales,
      categoriasSecundarias,
      direccion,
      emprendimientoPhone,
      redes_sociales,
      latitud,
      longitud
    } = req.body;

    if (categoriasPrincipales) {
      if (
        !Array.isArray(categoriasPrincipales) ||
        !categoriasPrincipales.every(cat => categoriasPermitidasPrincipales.includes(cat))
      ) {
        return res.status(400).json({ error: "Categorías principales inválidas" });
      }
    }

    if (categoriasSecundarias && categoriasPrincipales) {
      const secundariasInvalidas = categoriasSecundarias.filter(sec => {
        return !categoriasPrincipales.some(principal =>
          (categoriasSecundariasPorPrincipal[principal] || []).includes(sec)
        );
      });

      if (secundariasInvalidas.length > 0) {
        return res.status(400).json({
          error: `Categorías secundarias inválidas: ${secundariasInvalidas.join(", ")}`
        });
      }
    }

    const updatePayload = {
      nombre,
      descripcion,
      categoriasPrincipales,
      categoriasSecundarias,
      direccion,
      emprendimientoPhone,
      redes_sociales,
      latitud,
      longitud,
      updated_at: new Date().toISOString()
    };

    if (req.emprendimientoLogoUrl) {
      updatePayload.logo = req.emprendimientoLogoUrl;
    }

    // Filtrar nulos o undefined
    const filteredPayload = Object.fromEntries(
      Object.entries(updatePayload).filter(([_, val]) => val !== undefined)
    );

    const updated = await emprendimientoService.updateEmprendimiento(
      emprendimientoId,
      filteredPayload
    );

    res.status(200).json({
      message: "Emprendimiento actualizado exitosamente",
      emprendimiento: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Eliminar emprendimiento
export async function deleteEmprendimientoController(req, res) {
  try {
    const emprendimientoId = req.params.id;
    const userIdFromToken = req.user.id;
    const userRole = req.user.role;

    const emprendimiento = await emprendimientoService.getEmprendimientoById(emprendimientoId);
    if (!emprendimiento) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    // Permisos
    if (userRole !== "admin" && emprendimiento.userID !== userIdFromToken) {
      return res.status(403).json({ error: "No autorizado para eliminar este emprendimiento" });
    }

    // Si tiene imagen, eliminarla del bucket
    if (emprendimiento.logo) {
      const urlParts = emprendimiento.logo.split("/");
      const path = urlParts.slice(7).join("/");
      await supabase.storage.from("emprendimientoslogos").remove([path]);
    }

    const { error: deleteError } = await supabase
      .from("Comercio")
      .delete()
      .eq("id", emprendimientoId);
    if (deleteError) throw deleteError;

     // Cambiar rol del emprendedor a cliente 
    if (userRole !== "admin") {
      const { error: roleError } = await supabase
        .from("users")
        .update({ user_role: "cliente" })
        .eq("id", userIdFromToken);
      if (roleError) throw roleError;
    }

    res.status(200).json({ message: "Emprendimiento eliminado exitosamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Buscar emprendimientos por nombre
export async function searchEmprendimientosByNombreController(req, res) {
  try {
    const { nombre } = req.query;

    if (!nombre) {
      return res
        .status(400)
        .json({ error: "El parámetro 'nombre' es requerido" });
    }

    const resultados =
      await emprendimientoService.searchEmprendimientosByNombre(nombre);

    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// Obtener emprendimientos por categoría principal
export async function getEmprendimientosByCategoriaController(req, res) {
  try {
    const { categoria } = req.query;

    if (!categoria) {
      return res
        .status(400)
        .json({ error: "Debe proporcionar una categoría principal" });
    }

    if (!categoriasPermitidasPrincipales.includes(categoria)) {
      return res.status(400).json({ error: "Categoría principal no válida" });
    }

    const emprendimientos =
      await emprendimientoService.getEmprendimientosByCategoriaPrincipal(
        categoria
      );
    res.json(emprendimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Actualizar el propio emprendimiento del usuario autenticado
export async function updateOwnEmprendimientoController(req, res) {
  try {
    const userId = req.user.id;

    const emprendimiento = await emprendimientoService.getEmprendimientoByUserId(userId);
    if (!emprendimiento) {
      return res.status(404).json({ error: "No tienes un emprendimiento registrado" });
    }

    const {
      nombre,
      descripcion,
      categoriasPrincipales,
      categoriasSecundarias,
      direccion,
      emprendimientoPhone,
      redes_sociales,
      latitud,
      longitud
    } = req.body;

    if (categoriasPrincipales) {
      if (
        !Array.isArray(categoriasPrincipales) ||
        !categoriasPrincipales.every(cat => categoriasPermitidasPrincipales.includes(cat))
      ) {
        return res.status(400).json({ error: "Categorías principales inválidas" });
      }
    }

    if (categoriasSecundarias && categoriasPrincipales) {
      const secundariasInvalidas = categoriasSecundarias.filter(sec => {
        return !categoriasPrincipales.some(principal =>
          (categoriasSecundariasPorPrincipal[principal] || []).includes(sec)
        );
      });

      if (secundariasInvalidas.length > 0) {
        return res.status(400).json({
          error: `Categorías secundarias inválidas: ${secundariasInvalidas.join(", ")}`
        });
      }
    }

    const updatePayload = {
      nombre,
      descripcion,
      categoriasPrincipales,
      categoriasSecundarias,
      direccion,
      emprendimientoPhone,
      redes_sociales,
      latitud,
      longitud,
      updated_at: new Date().toISOString()
    };

    if (req.emprendimientoLogoUrl) {
      updatePayload.logo = req.emprendimientoLogoUrl;
    }

    const filteredPayload = Object.fromEntries(
      Object.entries(updatePayload).filter(([_, val]) => val !== undefined)
    );

    const updated = await emprendimientoService.updateEmprendimiento(emprendimiento.id, filteredPayload);

    res.status(200).json({
      message: "Emprendimiento actualizado exitosamente",
      emprendimiento: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Eliminar el propio emprendimiento del usuario autenticado
export async function deleteOwnEmprendimientoController(req, res) {
  try {
    const userId = req.user.id;

    const emprendimiento = await emprendimientoService.getEmprendimientoByUserId(userId);
    if (!emprendimiento) {
      return res.status(404).json({ error: "No tienes un emprendimiento registrado" });
    }

    if (emprendimiento.logo) {
      const urlParts = emprendimiento.logo.split("/");
      const path = urlParts.slice(7).join("/");
      await supabase.storage.from("emprendimientoslogos").remove([path]);
    }

    await emprendimientoService.deleteEmprendimiento(emprendimiento.id);

    const { error: roleError } = await supabase
      .from("users")
      .update({ user_role: "cliente" })
      .eq("id", userId);

    if (roleError) throw roleError;

    res.status(200).json({ message: "Emprendimiento eliminado exitosamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
