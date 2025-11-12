// En Joyeria-Diana-Laura/Backend/src/routes/authRoutes.ts
import express from 'express';
import { 
    register, 
    login, 
    forgotPassword, 
    resetPassword,
    checkUserExists,
    checkEmailCredits,
    checkEmailConfig
} from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/check-user', checkUserExists); 
router.get('/email-credits', checkEmailCredits);
router.get('/email-config', checkEmailConfig);

export default router;