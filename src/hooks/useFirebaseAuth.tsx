import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'waiter' | 'kitchen';
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: User['role']) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData.name,
            role: userData.role
          });
        }
        setFirebaseUser(firebaseUser);
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: result.user.uid,
          email: result.user.email!,
          name: userData.name,
          role: userData.role
        });
        return true;
      } else {
        toast.error('Usuario no encontrado en la base de datos');
        await signOut(auth);
        return false;
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error logging in:', authError.code, authError.message);
      // Mapear códigos comunes a mensajes amigables
      const code = authError.code || '';
      let message = 'Error al iniciar sesión';
      switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/invalid-password':
          message = 'Credenciales inválidas. Revisa tu email y contraseña.';
          break;
        case 'auth/user-not-found':
          message = 'Usuario no encontrado. Verifica el email.';
          break;
        case 'auth/too-many-requests':
          message = 'Demasiados intentos fallidos. Intenta más tarde.';
          break;
        case 'auth/network-request-failed':
          message = 'Error de red. Revisa tu conexión o extensiones que bloqueen solicitudes.';
          break;
        default:
          message = authError.message || message;
      }
      toast.error(message);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: User['role']): Promise<boolean> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user data to Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        name,
        email,
        role,
        createdAt: new Date()
      });

      setUser({
        id: result.user.uid,
        email: result.user.email!,
        name,
        role
      });

      return true;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error registering:', authError.code, authError.message);
      const code = authError.code || '';
      let message = 'Error al registrar';
      switch (code) {
        case 'auth/email-already-in-use':
          message = 'El email ya está en uso.';
          break;
        case 'auth/weak-password':
          message = 'La contraseña es muy débil.';
          break;
        default:
          message = authError.message || message;
      }
      toast.error(message);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error logging out:', authError);
      toast.error('Error al cerrar sesión');
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      login, 
      register, 
      logout, 
      isAuthenticated, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};