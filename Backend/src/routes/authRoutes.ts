    // Ruta: Joyeria-Diana-Laura/Backend/src/routes/authRoutes.ts
    import express from 'express';
    import { 
        register, 
        login, 
        forgotPassword, 
        resetPassword,
        resetPasswordFirebase,
        checkUserExists,
        checkEmailCredits,
        checkEmailConfig,
        checkEmailVerification,
        resendVerificationEmail,
        getUserProfile,
        testEmailConfiguration // 🆕 Nueva ruta
    } from '../controllers/authController';

    const router = express.Router();

    // 🔐 Rutas de autenticación principales
    router.post('/register', register);
    router.post('/login', login);
    router.post('/forgot-password', forgotPassword);
    router.post('/reset-password', resetPassword);
    router.post('/reset-password-firebase', resetPasswordFirebase);

    // 🔍 Rutas de verificación y consulta
    router.post('/check-user', checkUserExists);
    router.get('/email-credits', checkEmailCredits);
    router.get('/email-config', checkEmailConfig);
    router.get('/test-email-config', testEmailConfiguration); // 🆕 Nueva ruta

    // 🆕 Nuevas rutas para Firestore y verificación de email
    router.get('/verify-email/:uid', checkEmailVerification);
    router.post('/resend-verification', resendVerificationEmail);
    router.get('/profile/:uid', getUserProfile);

    export default router;