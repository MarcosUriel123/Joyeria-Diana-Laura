// Ruta: Joyeria-Diana-Laura/Backend/src/controllers/userController.ts
import { Request, Response } from 'express';
import * as userModel from '../models/userModel';

// Obtener perfil de usuario por ID
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await userModel.getUserById(parseInt(id));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // No devolver el password_hash por seguridad
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error en getUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar perfil de usuario
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body;
    
    if (!nombre && !email) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un campo para actualizar'
      });
    }
    
    const success = await userModel.updateUser(parseInt(id), { nombre, email });
    
    if (success) {
      res.json({
        success: true,
        message: 'Perfil actualizado correctamente'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado o sin cambios'
      });
    }
  } catch (error) {
    console.error('Error en updateUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar usuario (soft delete)
export const deleteUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = await userModel.deleteUser(parseInt(id));
    
    if (success) {
      res.json({
        success: true,
        message: 'Usuario eliminado correctamente'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
  } catch (error) {
    console.error('Error en deleteUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todos los usuarios (solo para administradores)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userModel.getAllUsers();
    
    // No devolver passwords
    const usersWithoutPasswords = users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json({
      success: true,
      data: usersWithoutPasswords
    });
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};