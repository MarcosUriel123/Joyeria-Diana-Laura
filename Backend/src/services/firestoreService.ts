// Ruta: Joyeria-Diana-Laura/Backend/src/services/firestoreService.ts
import { db } from '../config/firebase';

export interface FirestoreUser {
  uid: string;
  email: string;
  nombre: string;
  emailVerified: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  ultimoLogin?: Date;
  activo: boolean;
}

export class FirestoreService {
  /**
   * Crear usuario en Firestore
   */
  static async createUser(userData: FirestoreUser): Promise<boolean> {
    try {
      await db.collection('users').doc(userData.uid).set({
        ...userData,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      });
      
      console.log(`✅ Usuario creado en Firestore: ${userData.email}`);
      return true;
    } catch (error) {
      console.error('❌ Error creando usuario en Firestore:', error);
      return false;
    }
  }

  /**
   * Obtener usuario de Firestore por UID
   */
  static async getUserByUid(uid: string): Promise<FirestoreUser | null> {
    try {
      const doc = await db.collection('users').doc(uid).get();
      
      if (doc.exists) {
        return doc.data() as FirestoreUser;
      }
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo usuario de Firestore:', error);
      return null;
    }
  }

  /**
   * Actualizar último login
   */
  static async updateLastLogin(uid: string): Promise<boolean> {
    try {
      await db.collection('users').doc(uid).update({
        ultimoLogin: new Date(),
        fechaActualizacion: new Date()
      });
      return true;
    } catch (error) {
      console.error('❌ Error actualizando último login:', error);
      return false;
    }
  }

  /**
   * Verificar si email existe en Firestore
   */
  static async emailExistsInFirestore(email: string): Promise<boolean> {
    try {
      const snapshot = await db.collection('users')
        .where('email', '==', email)
        .where('activo', '==', true)
        .limit(1)
        .get();
      
      return !snapshot.empty;
    } catch (error) {
      console.error('❌ Error verificando email en Firestore:', error);
      return false;
    }
  }

  /**
   * Marcar email como verificado
   */
  static async markEmailAsVerified(uid: string): Promise<boolean> {
    try {
      await db.collection('users').doc(uid).update({
        emailVerified: true,
        fechaActualizacion: new Date()
      });
      console.log(`✅ Email marcado como verificado para usuario: ${uid}`);
      return true;
    } catch (error) {
      console.error('❌ Error marcando email como verificado:', error);
      return false;
    }
  }

  /**
   * Crear registro de actividad
   */
  static async logUserActivity(uid: string, activity: string, metadata?: any): Promise<boolean> {
    try {
      await db.collection('userActivities').doc().set({
        uid,
        activity,
        metadata,
        timestamp: new Date()
      });
      return true;
    } catch (error) {
      console.error('❌ Error registrando actividad:', error);
      return false;
    }
  }
}