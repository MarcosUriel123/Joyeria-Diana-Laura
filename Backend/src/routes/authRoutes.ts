// Ruta: Joyeria-Diana-Laura/Backend/src/routes/authRoutes.ts
import express from 'express';
import { 
    login, 
    forgotPassword, 
    resetPassword,
    checkUserExists,
    checkEmailCredits,
    checkEmailConfig,
    validateEmail,          // 🎯 NUEVA
    syncUserToPostgreSQL,   // 🎯 NUEVA
    checkFirebaseUser       // 🎯 NUEVA
} from '../controllers/authController';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/check-user', checkUserExists); 
router.get('/email-credits', checkEmailCredits);
router.get('/check-email-config', checkEmailConfig);
router.post('/validate-email', validateEmail);        // 🎯 NUEVA RUTA
router.post('/sync-user', syncUserToPostgreSQL);      // 🎯 NUEVA RUTA
router.post('/check-firebase-user', checkFirebaseUser); // 🎯 NUEVA RUTA

export default router;