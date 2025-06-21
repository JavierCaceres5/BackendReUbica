import { supabase } from "../config/config.js";

export const uploadUserImageToSupabase = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const file = req.file;
    const filePath = `user_icons/${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
      .from("usericons")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error("Error al subir imagen a Supabase:", error);
      return res
        .status(500)
        .json({ error: "Error al subir imagen a Supabase" });
    }

    const { data: publicUrlData } = supabase.storage
      .from("usericons")
      .getPublicUrl(filePath);

    req.userPhotoUrl = publicUrlData.publicUrl;
    next();
  } catch (err) {
    console.error("Middleware error:", err);
    res
      .status(500)
      .json({ error: "Error interno al procesar imagen de usuario" });
  }
};

export const uploadEmprendimientoImageToSupabase = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const file = req.file;
    const filePath = `emprendimientos_logos/${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
      .from("emprendimientoslogos")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error("Error al subir imagen a Supabase:", error);
      return res
        .status(500)
        .json({ error: "Error al subir imagen a Supabase" });
    }

    const { data: publicUrlData } = supabase.storage
      .from("emprendimientoslogos")
      .getPublicUrl(filePath);

    req.emprendimientoLogoUrl = publicUrlData.publicUrl;
    next();
  } catch (err) {
    console.error("Middleware error:", err);
    res
      .status(500)
      .json({ error: "Error interno al procesar imagen del emprendimiento" });
  }
};

export const uploadProductImageToSupabase = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const file = req.file;
    const filePath = `productos_images/${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
      .from("productosimages")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error("Error al subir imagen a Supabase:", error);
      return res
        .status(500)
        .json({ error: "Error al subir imagen a Supabase" });
    }

    const { data: publicUrlData } = supabase.storage
      .from("productosimages")
      .getPublicUrl(filePath);

    req.productImageUrl = publicUrlData.publicUrl;
    next();
  } catch (err) {
    console.error("Middleware error:", err);
    res
      .status(500)
      .json({ error: "Error interno al procesar imagen del emprendimiento" });
  }
};


