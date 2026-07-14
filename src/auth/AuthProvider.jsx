import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Any successfully signed-in Firebase Auth user is a valid app user -
// no manual approval gate. We still maintain a users/{uid} profile doc
// (email + joinedAt) since other features (shelf counts, etc.) key off it.
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthError("");

      if (!user) {
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: user.email || "no-email@unknown.com",
            joinedAt: serverTimestamp(),
          });
        }

        setCurrentUser(user);
        setAuthLoading(false);
      } catch (err) {
        console.error("Error setting up user profile:", err);
        setAuthError("Couldn't set up your account. Please try again.");
        await signOut(auth);
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ currentUser, authLoading, authError, logout }}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
};
