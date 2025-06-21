import * as productoService from "../services/producto.service.js";
import { supabase } from "../config/config.js";

// Obtener todos los productos
export async function getProductosController(req, res) {
  try {
    const productos = await productoService.getAllProductos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener producto por ID
export async function getProductoByIdController(req, res) {
  try {
    const id = req.params.id;
    const producto = await productoService.getProductoById(id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Crear producto (solo emprendedores o admins)
export async function createProductoController(req, res) {
  try {
    const { nombre, descripcion, precio } = req.body;
    const userID = req.user.id;
    const userRole = req.user.role;

    if (!nombre || !descripcion || precio == null) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    // Verificar que tenga un emprendimiento registrado
    const { data: comercio, error } = await supabase
      .from("Comercio")
      .select("id")
      .eq("userID", userID)
      .maybeSingle();

    if (error) throw error;
    if (!comercio) {
      return res.status(400).json({ error: "Debe tener un emprendimiento registrado" });
    }

    const image = req.productImageUrl || null;

    const producto = await productoService.createProducto({
      nombre,
      descripcion,
      precio,
      product_image: image,
      emprendimientoID: comercio.id,
    });

    res.status(201).json({ message: "Producto creado", producto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Actualizar producto
export async function updateProductoController(req, res) {
  try {
    const id = req.params.id;
    const userID = req.user.id;
    const userRole = req.user.role;

    const producto = await productoService.getProductoById(id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Validar propiedad
    const { data: comercio, error } = await supabase
      .from("Comercio")
      .select("id, userID")
      .eq("id", producto.emprendimientoID)
      .maybeSingle();

    if (error) throw error;

    if (!comercio || (userRole !== "admin" && comercio.userID !== userID)) {
      return res.status(403).json({ error: "No autorizado para actualizar este producto" });
    }

    const { nombre, descripcion, precio } = req.body;
    const image = req.productImageUrl;

    const payload = {
      nombre,
      descripcion,
      precio,
      updated_at: new Date().toISOString(),
    };

    if (image) payload.product_image = image;

    const filtered = Object.fromEntries(
      Object.entries(payload).filter(([_, val]) => val !== undefined)
    );

    const updated = await productoService.updateProducto(id, filtered);

    res.json({ message: "Producto actualizado", producto: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Eliminar producto
export async function deleteProductoController(req, res) {
  try {
    const id = req.params.id;
    const userID = req.user.id;
    const userRole = req.user.role;

    const producto = await productoService.getProductoById(id);
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const { data: comercio, error } = await supabase
      .from("Comercio")
      .select("userID")
      .eq("id", producto.emprendimientoID)
      .maybeSingle();

    if (error) throw error;

    if (!comercio || (userRole !== "admin" && comercio.userID !== userID)) {
      return res.status(403).json({ error: "No autorizado para eliminar este producto" });
    }

    if (producto.product_image) {
      const path = producto.product_image.split("/").slice(7).join("/");
      await supabase.storage.from("productimages").remove([path]);
    }

    await productoService.deleteProducto(id);

    res.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Buscar productos por nombre
export async function searchProductosByNombreController(req, res) {
  try {
    const { nombre } = req.query;
    if (!nombre) {
      return res.status(400).json({ error: "Debe incluir el nombre a buscar" });
    }

    const resultados = await productoService.searchProductoByNombre(nombre);
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
