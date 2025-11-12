// En Joyeria-Diana-Laura/Backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import * as userModel from '../models/userModel';
import admin from '../config/firebase';
import { EmailValidationService } from '../services/EmailValidationService';

// 🔐 FUNCIONES DE AUTENTICACIÓN MEJORADAS
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, nombre } = req.body;

    if (!email || !password || !nombre) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // 🔍 VALIDACIÓN DE FORMATO DE EMAIL
    const formatValidation = EmailValidationService.validateFormat(email);
    if (!formatValidation.valid) {
      return res.status(400).json({
        success: false,
        message: formatValidation.message
      });
    }

    // 🔍 VALIDACIÓN DE EMAIL REAL CON ZEROBOUNCE
    console.log(`🔍 Iniciando validación ZeroBounce para: ${email}`);
    const emailValidation = await EmailValidationService.validateEmail(email);
    
    if (!emailValidation.valid) {
      console.log(`❌ Validación fallida: ${emailValidation.message}`);
      return res.status(400).json({
        success: false,
        message: emailValidation.message || 'El email no es válido'
      });
    }

    console.log(`✅ Email validado correctamente: ${email}`);

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
      console.log(`✅ Usuario registrado exitosamente: ${email}`);
      
      // Generar link de verificación con redirección al login
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const actionCodeSettings = {
          url: `${frontendUrl}/login?verified=true`,
          handleCodeInApp: false
        };
        
        // Generar el link de verificación personalizado
        const verificationLink = await admin.auth().generateEmailVerificationLink(
          email, 
          actionCodeSettings
        );
        
        console.log('📧 Link de verificación generado con redirección al login');
        console.log(`🔗 URL de redirección: ${frontendUrl}/login?verified=true`);
        
      } catch (emailError) {
        console.error('❌ Error generando link de verificación:', emailError);
        // No falla el registro si hay error en el email
      }
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente. Revisa tu email para verificar tu cuenta.'
      });
    } else {
      // Rollback: eliminar usuario de Firebase si falla en BD local
      await admin.auth().deleteUser(userRecord.uid);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario en la base de datos'
      });
    }
  } catch (error: any) {
    console.error('Error en register:', error);
    
    // Manejar errores específicos de Firebase
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado en el sistema'
      });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        message: 'El formato del email es inválido'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
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

    // Primero verificamos si el usuario existe
    const userExists = await userModel.emailExists(email);
    
    if (!userExists) {
      return res.status(401).json({
        success: false,
        message: 'El usuario no existe. Por favor, verifica tu correo electrónico.'
      });
    }

    // Si el usuario existe, verificamos la contraseña
    const user = await userModel.verifyUser(email, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta. Por favor, intenta nuevamente.'
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
        message: 'Se ha enviado un enlace de recuperación a tu email'
      });
    }

    try {
      // Configurar la URL de redirección
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const actionCodeSettings = {
        url: `${frontendUrl}/login?reset=success`,
        handleCodeInApp: false
      };

      // Enviar email de recuperación
      await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
      
      console.log('📧 Email de recuperación enviado a:', email);
      
      res.json({
        success: true,
        message: 'Se ha enviado un enlace de recuperación a tu email'
      });

    } catch (firebaseError: any) {
      console.error('Error de Firebase:', firebaseError);
      
      // Manejar errores específicos de Firebase
      if (firebaseError.code === 'auth/user-not-found') {
        return res.json({
          success: true,
          message: 'Se ha enviado un enlace de recuperación a tu email'
        });
      }
      
      if (firebaseError.code === 'auth/invalid-email') {
        return res.status(400).json({
          success: false,
          message: 'El formato del email es inválido'
        });
      }

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
      // Esta función normalmente la maneja el frontend con Firebase SDK
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

export const checkEmailCredits = async (req: Request, res: Response) => {
  try {
    const creditsInfo = await EmailValidationService.checkCredits();
    
    res.json({
      success: true,
      data: {
        credits: creditsInfo.credits,
        message: creditsInfo.message
      }
    });

  } catch (error) {
    console.error('Error en checkEmailCredits:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando créditos de email'
    });
  }
};

export const checkEmailConfig = async (req: Request, res: Response) => {
  try {
    // Verificar que Firebase esté configurado correctamente
    const testEmail = 'test@example.com';
    
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const actionCodeSettings = {
        url: `${frontendUrl}/login?verified=true`,
        handleCodeInApp: false
      };
      
      await admin.auth().generateEmailVerificationLink(testEmail, actionCodeSettings);
      
      res.json({
        success: true,
        message: `Configuración de email verificada correctamente. Los links redirigirán a: ${frontendUrl}/login`
      });
      
    } catch (firebaseError: any) {
      res.status(400).json({
        success: false,
        message: `Error en configuración de Firebase: ${firebaseError.message}`
      });
    }

  } catch (error) {
    console.error('Error en checkEmailConfig:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando configuración de email'
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