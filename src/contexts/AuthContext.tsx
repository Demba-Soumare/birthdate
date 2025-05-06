import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { loginUser, registerUser, signOut } from '../services/authService';
import { AuthContextType, User } from '../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        setCurrentUser({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
          hasCompletedOnboarding: userData?.hasCompletedOnboarding || false,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateUserOnboardingStatus = async () => {
    if (!currentUser) return;
    
    await setDoc(doc(db, 'users', currentUser.uid), {
      hasCompletedOnboarding: true,
    }, { merge: true });

    setCurrentUser(prev => prev ? {
      ...prev,
      hasCompletedOnboarding: true,
    } : null);
  };

  const login = async (email: string, password: string) => {
    try {
      await loginUser(email, password);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await registerUser(email, password);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateUserOnboardingStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};