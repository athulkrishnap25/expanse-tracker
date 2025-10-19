import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// 1. Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// 2. Create the function to sign in with Google
export const signInWithGoogle = async () => {
  try {
    // 3. This triggers the pop-up window
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // 4. IMPORTANT: Check if the user already exists in our Firestore 'users' collection
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    // 5. If the user does NOT exist, create a new document for them
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
        // Since it's a single-user app, you can default the role
        // In a multi-user app, you'd handle this differently
        role: 'admin', 
      });
    }
    
    // 6. Return the user object on success
    return user;

  } catch (error) {
    console.error("Error during Google sign-in:", error);
    // Return null or throw the error so the component can handle it
    return null;
  }
};