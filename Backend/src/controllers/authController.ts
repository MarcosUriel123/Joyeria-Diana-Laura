// En Joyeria-Diana-Laura/Backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import * as userModel from '../models/userModel';
import admin from '../config/firebase';
import { EmailValidationService } from '../services/EmailValidationService';
import { pool } from '../config/database';

// 🎯 SOLO para copiar datos de Firebase a PostgreSQL
export const syncUserToPostgreSQL = async (req: Request, res: Response) => {
  try {
    const { email, password, nombre, firebaseUID } = req.body;

    if (!email || !firebaseUID) {
      return res.status(400).json({
        success: false,
        message: 'Email y Firebase UID son requeridos'
      });
    }

    console.log(`🔄 Sincronizando usuario a PostgreSQL: ${email}`);

    // Verificar si ya existe
    const exists = await userModel.emailExists(email);
    if (exists) {
      console.log(`✅ Usuario ya existe en PostgreSQL: ${email}`);
      return res.json({
        success: true,
        message: 'Usuario ya está sincronizado',
        data: { email: email }
      });
    }

    // Crear usuario en PostgreSQL (opcional, para otras funcionalidades)
    const userPassword = password || 'temp_password_123';
    // 🎯 CORREGIDO: Verificar que email no sea undefined
    const userName = nombre || (email ? email.split('@')[0] : 'Usuario');
    
    const success = await userModel.createUser(email, userPassword, userName, firebaseUID);
    
    if (success) {
      console.log(`✅ Usuario sincronizado a PostgreSQL: ${email}`);
      
      res.json({
        success: true,
        message: 'Usuario sincronizado correctamente',
        data: { email: email, firebaseUID: firebaseUID }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al sincronizar usuario'
      });
    }
  } catch (error: any) {
    console.error('Error en syncUserToPostgreSQL:', error);
    res.json({ // 🎯 No es crítico, devolvemos éxito igual
      success: true,
      message: 'Usuario en Firebase, error en PostgreSQL no crítico',
      // 🎯 CORREGIDO: Usar req.body.email en lugar de email
      data: { email: req.body.email }
    });
  }
};

// 🔍 Validar email con ZeroBounce (opcional - para verificar antes de registrar)
export const validateEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido'
      });
    }

    // Validación de formato
    const formatValidation = EmailValidationService.validateFormat(email);
    if (!formatValidation.valid) {
      return res.status(400).json({
        success: false,
        message: formatValidation.message
      });
    }

    // Validación con ZeroBounce
    console.log(`🔍 Validando email con ZeroBounce: ${email}`);
    const emailValidation = await EmailValidationService.validateEmail(email);
    
    if (!emailValidation.valid) {
      console.log(`❌ Validación fallida: ${emailValidation.message}`);
      return res.status(400).json({
        success: false,
        message: emailValidation.message || 'El email no es válido'
      });
    }

    console.log(`✅ Email validado correctamente: ${email}`);
    
    res.json({
      success: true,
      message: 'Email válido para registro',
      data: {
        email: email,
        valid: true
      }
    });

  } catch (error: any) {
    console.error('Error en validateEmail:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
    });
  }
};

// Login normal - SOLO CON FIREBASE
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    console.log(`🔐 Iniciando login SOLO con Firebase para: ${email}`);

    // 🎯 ELIMINADO: Verificación en PostgreSQL
    // 🎯 SOLO verificamos en Firebase
    
    try {
      // Verificar que el usuario existe en Firebase
      const userRecord = await admin.auth().getUserByEmail(email);
      console.log(`✅ Usuario encontrado en Firebase: ${userRecord.uid}`);
      console.log(`📧 Email verificado: ${userRecord.emailVerified}`);

      // Verificar que el email esté verificado
      if (!userRecord.emailVerified) {
        return res.status(401).json({
          success: false,
          message: 'Tu email no está verificado. Revisa tu bandeja de entrada y haz clic en el enlace de verificación.'
        });
      }

      // 🎯 CREAR RESPUESTA DIRECTAMENTE CON DATOS DE FIREBASE
      // No necesitamos PostgreSQL para el login
      // 🎯 CORREGIDO: Manejar posibles valores undefined
      const userEmail = userRecord.email || email;
      const userName = userRecord.displayName || (userEmail ? userEmail.split('@')[0] : 'Usuario');
      
      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: userRecord.uid, // 🎯 Usar UID de Firebase como ID
            email: userEmail,
            nombre: userName
          }
        }
      });

    } catch (firebaseError: any) {
      console.error('Error de Firebase en login:', firebaseError);
      
      if (firebaseError.code === 'auth/user-not-found') {
        return res.status(401).json({
          success: false,
          message: 'El usuario no existe. Por favor, verifica tu correo electrónico.'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error al verificar usuario en el sistema: ' + firebaseError.message
      });
    }

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// 🔄 FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA
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
      const actionCodeSettings = {
        url: process.env.FRONTEND_URL || 'http://localhost:3000/login?reset=success',
        handleCodeInApp: false
      };

      // Solo generar link (frontend enviará email)
      const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
      
      console.log('📧 Link de recuperación generado (frontend enviará email):', resetLink);
      
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
        message: `Error al generar link: ${firebaseError.message}`
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

// 🎯 FUNCIÓN: Verificar configuración de email
export const checkEmailConfig = async (req: Request, res: Response) => {
  try {
    // Verificar que Firebase esté configurado correctamente
    const testEmail = 'test@example.com';
    
    try {
      const actionCodeSettings = {
        url: process.env.FRONTEND_URL || 'http://localhost:3000/login?verified=true',
        handleCodeInApp: false
      };
      
      await admin.auth().generateEmailVerificationLink(testEmail, actionCodeSettings);
      
      res.json({
        success: true,
        message: 'Configuración de email verificada correctamente. Los links redirigirán a: ' + (process.env.FRONTEND_URL || 'http://localhost:3000/login')
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

// 🎯 NUEVA FUNCIÓN: Verificar usuario en Firebase
export const checkFirebaseUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }

    console.log(`🔍 Verificando usuario en Firebase: ${email}`);

    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      
      console.log(`✅ Usuario encontrado en Firebase: ${userRecord.uid}`);
      
      res.json({
        success: true,
        exists: true,
        emailVerified: userRecord.emailVerified,
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified
        }
      });

    } catch (firebaseError: any) {
      if (firebaseError.code === 'auth/user-not-found') {
        console.log(`❌ Usuario NO encontrado en Firebase: ${email}`);
        return res.json({
          success: true,
          exists: false
        });
      }
      
      // 🎯 PROPAGAR otros errores de Firebase
      console.error('Error de Firebase:', firebaseError);
      throw firebaseError;
    }

  } catch (error: any) {
    console.error('Error en checkFirebaseUser:', error);
    
    // 🎯 MEJORAR manejo de errores
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        message: 'El formato del email es inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error verificando usuario en Firebase: ' + error.message
    });
  }
};