import * as usersService from "../services/user.service.js";
import { supabase } from "../config/config.js";
import { v4 as uuidv4 } from "uuid"; // Esto es para el nombre aleatorio de la imagen
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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
    const userIdFromParams = req.params.id;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userIdFromParams)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Usuario no encontrado" });

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

export async function deleteOwnUserController(req, res) {
  try {
    const userRole = req.user.role;
    const userIdFromToken = req.user.id;
    const userIdToDelete = req.params.id || userIdFromToken;

    if (userRole !== "admin" && userIdToDelete !== userIdFromToken) {
      return res
        .status(403)
        .json({ error: "No autorizado para eliminar este usuario" });
    }

    if (userRole === "admin" && userIdToDelete === userIdFromToken) {
      return res.status(403).json({
        error: "No puedes eliminar tu propia cuenta de administrador.",
      });
    }

    const { data: user, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userIdToDelete)
      .maybeSingle();

    if (findError) throw findError;
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (user.user_icon) {
      const urlParts = user.user_icon.split("/");
      const filePath = urlParts.slice(7).join("/");
      await supabase.storage.from("usericons").remove([filePath]);
    }

    await usersService.deleteUser(userIdToDelete);

    return res.status(200).json({ message: "Usuario eliminado exitosamente." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateOwnUserController(req, res) {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    if (updateData.user_icon) {
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("user_icon")
        .eq("id", userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (
        existingUser?.user_icon &&
        existingUser.user_icon !== updateData.user_icon
      ) {
        const urlParts = existingUser.user_icon.split("/");
        const filePath = urlParts.slice(7).join("/");
        await supabase.storage.from("usericons").remove([filePath]);
      }
    }

    const updatedUser = await usersService.updateUser(userId, updateData);

    return res
      .status(200)
      .json({ message: "Perfil actualizado correctamente", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function sendResetCode(req, res) {
  try {
    const { email } = req.body;
    const user = await usersService.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await usersService.createResetToken(email, code, expiresAt);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ReUbica - Soporte" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "🔐 Tu código para recuperar la contraseña",
      text: `

¡Hola!

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en ReUbica.

📌 Tu código de verificación es: ${code}

⏱️ Este código estará activo por 10 minutos.

⚠️ Por tu seguridad, NO lo compartas con nadie.

Gracias por usar ReUbica 💚

— El equipo de ReUbica`,
    });

    res.status(200).json({ message: "Código enviado al correo" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, code, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword)
      return res.status(400).json({ error: "Las contraseñas no coinciden" });

    const token = await usersService.getValidResetToken(email, code);
    if (!token)
      return res.status(400).json({ error: "Código inválido o expirado" });

    await usersService.changePassword(email, newPassword);
    await usersService.markResetTokenAsUsed(token.id);

    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
