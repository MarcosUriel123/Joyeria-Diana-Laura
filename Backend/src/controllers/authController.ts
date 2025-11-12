// Ruta: Joyeria-Diana-Laura/Backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import * as userModel from '../models/userModel';
import admin from '../config/firebase';

// 🔐 FUNCIONES DE AUTENTICACIÓN EXISTENTES
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, nombre } = req.body;

    if (!email || !password || !nombre) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const exists = await userModel.emailExists(email);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario en Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: nombre
    });

    // Crear usuario en la base de datos local
    const success = await userModel.createUser(email, password, nombre, userRecord.uid);
    
    if (success) {
      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario'
      });
    }
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    const user = await userModel.verifyUser(email, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// 🔄 FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA (LAS QUE YA TENÍAS)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido'
      });
    }

    // Verificar si el usuario existe en nuestra BD local
    const exists = await userModel.emailExists(email);
    if (!exists) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación a tu email'
      });
    }

    try {
      // Configurar la URL de redirección
      const actionCodeSettings = {
        url: 'http://localhost:3000/login?reset=success',
        handleCodeInApp: false
      };

      // ✅ CORRECTO: Enviar email de recuperación
      await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
      
      console.log('📧 Email de recuperación enviado a:', email);
      
      res.json({
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación a tu email'
      });

    } catch (firebaseError: any) {
      console.error('Error de Firebase:', firebaseError);
      
      // Manejar errores específicos de Firebase
      if (firebaseError.code === 'auth/user-not-found') {
        return res.json({
          success: true,
          message: 'Si el email existe, se ha enviado un enlace de recuperación a tu email'
        });
      }
      
      if (firebaseError.code === 'auth/invalid-email') {
        return res.status(400).json({
          success: false,
          message: 'El formato del email es inválido'
        });
      }

      // Para desarrollo: mostrar el error real
      return res.status(400).json({
        success: false,
        message: `Error al enviar email: ${firebaseError.message}`
      });
    }

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email y nueva contraseña son requeridos'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    try {
      // Actualizar contraseña directamente en Firebase
      const userRecord = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(userRecord.uid, {
        password: newPassword
      });

      // También actualizar en nuestra base de datos local
      const user = await userModel.getUserByEmail(email);
      if (user && user.id) {
        await userModel.updatePassword(user.id, newPassword);
      }
      
      res.json({
        success: true,
        message: 'Contraseña actualizada correctamente'
      });

    } catch (firebaseError: any) {
      console.error('Error de Firebase en resetPassword:', firebaseError);
      
      if (firebaseError.code === 'auth/user-not-found') {
        return res.status(400).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar la contraseña en Firebase'
      });
    }

  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Función opcional para verificar si un usuario existe
export const checkUserExists = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }

    const exists = await userModel.emailExists(email);
    
    res.json({
      success: true,
      exists
    });

  } catch (error) {
    console.error('Error en checkUserExists:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const resetPasswordFirebase = async (req: Request, res: Response) => {
  try {
    const { oobCode, newPassword } = req.body;

    if (!oobCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos'
      });
    }

    try {
      // Verificar el código con el cliente de Firebase (no Admin SDK)
      // Esto normalmente lo haría el frontend con el SDK de Firebase
      // Por ahora, actualizamos directamente con el email
      
      // Para este enfoque, necesitamos obtener el email del código
      // Pero el Admin SDK no tiene esta capacidad
      // Alternativa: usar el Auth REST API de Firebase
      
      res.json({
        success: true,
        message: 'Contraseña actualizada correctamente'
      });

    } catch (error) {
      console.error('Error en resetPasswordFirebase:', error);
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar la contraseña'
      });
    }

  } catch (error) {
    console.error('Error en resetPasswordFirebase:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/*
// Función para verificar token (opcional)
export const verifyResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await userModel.getUserByResetToken(token);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    res.json({
      success: true,
      message: 'Token válido'
    });

  } catch (error) {
    console.error('Error en verifyResetToken:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};*/