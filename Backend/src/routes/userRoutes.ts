// Ruta:Joyeria-Diana-Laura/Backend/src/routes/userRoutes.ts
import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsers
} from '../controllers/userController';

const router = express.Router();

// Rutas de usuarios
router.get('/', getAllUsers);           // Obtener todos los usuarios
router.get('/:id', getUserProfile);     // Obtener usuario por ID
router.put('/:id', updateUserProfile);  // Actualizar usuario
router.delete('/:id', deleteUserProfile); // Eliminar usuario

export default router;