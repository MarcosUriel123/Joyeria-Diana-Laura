// Ruta:Joyeria-Diana-Laura/Backend/src/routes/userRoutes.ts

import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsers  // Agregar esta función
} from '../controllers/userController';  // Quitar la extensión .js

const router = express.Router();

// Rutas de usuarios
router.get('/', getAllUsers);           // Obtener todos los usuarios
router.get('/:id', getUserProfile);     // Obtener usuario por ID (cambié uid por id)
router.put('/:id', updateUserProfile);  // Actualizar usuario (cambié uid por id)
router.delete('/:id', deleteUserProfile); // Eliminar usuario (cambié uid por id)

export default router;