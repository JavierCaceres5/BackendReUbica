export function parseArraysMiddleware(req, res, next) {
  try {
    if (typeof req.body.categoriasPrincipales === 'string') {
      req.body.categoriasPrincipales = JSON.parse(req.body.categoriasPrincipales);
    }
    if (typeof req.body.categoriasSecundarias === 'string') {
      req.body.categoriasSecundarias = JSON.parse(req.body.categoriasSecundarias);
    }
    if (typeof req.body.horarios_atencion === 'string') {
      req.body.horarios_atencion = JSON.parse(req.body.horarios_atencion);
    }
    if (typeof req.body.redes_sociales === 'string') {
      req.body.redes_sociales = JSON.parse(req.body.redes_sociales);
    }
    
    // Parseo numérico:
    if (typeof req.body.latitud === 'string') {
      req.body.latitud = parseFloat(req.body.latitud);
    }
    if (typeof req.body.longitud === 'string') {
      req.body.longitud = parseFloat(req.body.longitud);
    }
  } catch (err) {
    return res.status(400).json({ error: "Error parseando el body" });
  }
  next();
}
