import * as usersService from "../services/user.service.js";
import { supabase } from "../config/config.js";
import { v4 as uuidv4 } from "uuid"; // Esto es para el nombre aleatorio de la imagen
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function getUsers(req, res) {
  try {
    const users = await usersService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserById(req, res) {
  try {
    const userRole = req.user.role;
    const userIdFromToken = req.user.id;
    const userIdFromParams = req.params.id;

    if (userRole !== "admin" && userIdFromToken !== userIdFromParams) {
      return res
        .status(403)
        .json({ error: "No autorizado para ver este usuario" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userIdFromParams)
      .maybeSingle();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function registerUser(req, res) {
  try {
    const { firstname, lastname, email, password, phone, user_role } = req.body;

    // Verificar si el email ya existe
    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingUser)
      return res.status(400).json({ error: "El usuario ya existe" });
    if (existingError) throw existingError;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        phone,
        user_role,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Generar token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.user_role, email: newUser.email },
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: "7d" }
    );

    res
      .status(201)
      .json({ message: "Usuario creado exitosamente", token, user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Login (validación contra el email y password)
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, role: user.user_role, email: user.email },
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Actualizar usuario
export async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const userRole = req.user.role;
    const userIdFromToken = req.user.id;

    if (userRole === "admin") {
      // Admin no puede modificarse a sí mismo
      if (userIdFromToken === userId) {
        return res
          .status(403)
          .json({ error: "El admin no puede modificar su propio perfil." });
      }
    } else {
      // Si es cliente o emprendedor solo puede modificarse a sí mismo
      if (userIdFromToken !== userId) {
        return res
          .status(403)
          .json({ error: "No autorizado para modificar otros usuarios." });
      }
    }

    let userUpdate = {};

    // Bloquear modificación de rol
    if (userRole === "admin") {
      const { firstname, lastname, email, phone, user_role } = req.body;
      userUpdate = { firstname, lastname, email, phone, user_role };
    } else {
      const { phone } = req.body;
      userUpdate = { phone };
    }

    userUpdate.updated_at = new Date().toISOString();

    // Se verifica si en el middleware se subió una imagen, sino solo se agrega
    if (req.userPhotoUrl) {
      userUpdate.user_icon = req.userPhotoUrl;
    }

    const { data, error } = await supabase
      .from("users")
      .update(userUpdate)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Eliminar usuario
export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    const userRole = req.user.role;
    const userIdFromToken = req.user.id;

    // Verificar si el usuario tiene permisos para eliminar
    if (userRole !== "admin" && userIdFromToken !== userId) {
      return res
        .status(403)
        .json({ error: "No autorizado para eliminar este usuario" });
    }

    // Bloquear autoeliminación del admin
    if (userRole === "admin" && userIdFromToken === userId) {
      return res.status(403).json({
        error: "No puedes eliminar tu propia cuenta de administrador.",
      });
    }

    const { data: user, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: "User not found" });

    // Obtenemos el usuario para ver si tenía imagen

    if (user.user_icon) {
      const urlParts = user.user_icon.split("/");
      const filePath = urlParts.slice(7).join("/");
      await supabase.storage.from("usericons").remove([filePath]);
    }

    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);
    if (deleteError) throw deleteError;

    res.status(200).json({ message: "Usuario eliminado exitosamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
