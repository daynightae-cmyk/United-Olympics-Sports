import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0715083591",
  appId: "1:881627143001:web:cb07688f4721275cecca48",
  apiKey: "AIzaSyCUL3MNokeAWbvMtin-Mfc34aJf5_xP-c8",
  authDomain: "gen-lang-client-0715083591.firebaseapp.com",
  storageBucket: "gen-lang-client-0715083591.firebasestorage.app",
  messagingSenderId: "881627143001",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const initAuth = () => auth;

export const googleSignIn = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const logout = async () => {
  return await fbSignOut(auth);
};

export const getAccessToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};
