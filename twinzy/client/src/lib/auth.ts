import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "./firebase";
import { apiRequest } from "./queryClient";
import { User } from "@shared/schema";

// Register user with email and password
export const registerWithEmail = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    
    // Create user in our backend
    await apiRequest("POST", "/api/auth/user", {
      uid: user.uid,
      email: user.email,
      name: name,
      photoURL: user.photoURL || "",
    });
    
    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Sign in with email and password
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const { user } = result;
    
    // Create or get user from our backend
    await apiRequest("POST", "/api/auth/user", {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || "User",
      photoURL: user.photoURL || "",
    });
    
    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Sign in with GitHub
export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const { user } = result;
    
    // Create or get user from our backend
    await apiRequest("POST", "/api/auth/user", {
      uid: user.uid,
      email: user.email || `${user.uid}@github.user`,
      name: user.displayName || user.email?.split('@')[0] || "GitHub User",
      photoURL: user.photoURL || "",
    });
    
    return { success: true, user };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Send password reset email
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Get current user from backend
export const getCurrentUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    const response = await fetch(`/api/auth/user/${firebaseUser.uid}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        // User not found in our database, create it
        const result = await apiRequest("POST", "/api/auth/user", {
          uid: firebaseUser.uid,
          email: firebaseUser.email || `${firebaseUser.uid}@unknown.user`,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
          photoURL: firebaseUser.photoURL || "",
        });
        return result.json();
      }
      throw new Error("Failed to get user");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Observer for auth state changes
export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
