// Ruta: Joyeria-Diana-Laura/Backend/src/routes/authRoutes.ts
import express from 'express';
import { 
    register, 
    login, 
    forgotPassword, 
    resetPassword,
    checkUserExists 
} from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/check-user', checkUserExists); // Nueva ruta opcional

export default router;