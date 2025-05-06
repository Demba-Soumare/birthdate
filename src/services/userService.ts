import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types'; // Assurez-vous que ce type existe et inclut stripeAccountId?

const db = getFirestore();

// Fonction pour récupérer un profil utilisateur
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // Retourne les données en les typant
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    } else {
      console.log("No such user document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user document:", error);
    throw error; // Renvoyer l'erreur
  }
};

// Fonction pour créer ou mettre à jour un profil utilisateur
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    // Utiliser setDoc avec merge:true pour créer ou mettre à jour
    await setDoc(userDocRef, data, { merge: true }); 
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Vous pourriez avoir d'autres fonctions ici... 