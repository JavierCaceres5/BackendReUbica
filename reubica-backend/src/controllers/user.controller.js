import * as usersService from '../services/user.service.js';
import { supabase } from '../config/config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export async function getUsers(req, res) {
  try {
    const users = await usersService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUser(req, res) {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/config.js';

export async function createUser(req, res) {
  try {
    const { firstname, lastname, email, password, phone, user_role } = req.body;

    // Verificar si el email ya existe
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) return res.status(400).json({ error: 'El usuario ya existe' });
    if (existingError) throw existingError;

    // Subir imagen si viene
    let avatarUrl = null;
    if (req.file) {
      const file = req.file;
      const filePath = `avatars/${Date.now()}-${file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from('useravatar')
        .upload(filePath, file.buffer, { contentType: file.mimetype });

      if (uploadError) return res.status(500).json({ error: 'Error al subir imagen' });

      const { data: publicUrl } = supabase.storage.from('useravatar').getPublicUrl(filePath);
      avatarUrl = publicUrl.publicUrl;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        phone,
        user_role,
        photoProfile: avatarUrl
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Generar token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.user_role, email: newUser.email },
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ message: 'Usuario creado exitosamente', token, user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// Actualizar usuario
export async function updateUser(req, res) {
  try {
    const userUpdate = req.body;
    const userId = req.params.id;

    if (req.file) {
      const file = req.file;
      const filePath = `avatars/${Date.now()}-${file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from('useravatar')
        .upload(filePath, file.buffer, { contentType: file.mimetype });

      if (uploadError) return res.status(500).json({ error: 'Error al subir imagen' });

      const { data: publicUrl } = supabase.storage.from('useravatar').getPublicUrl(filePath);
      userUpdate.photoProfile = publicUrl.publicUrl;
    }

    const { data, error } = await supabase
      .from('users')
      .update(userUpdate)
      .eq('id', userId)
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

    // Primero obtenemos el usuario para ver si tenía imagen
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.photoProfile) {
      const urlParts = user.photoProfile.split('/');
      const filePath = urlParts.slice(7).join('/');
      await supabase.storage.from('useravatar').remove([filePath]);
    }

    const { error: deleteError } = await supabase.from('users').delete().eq('id', userId);
    if (deleteError) throw deleteError;

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Login (validación contra el email y password)
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, role: user.user_role, email: user.email },
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}