import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const { approved } = userSnap.data(); // only fetch approved
          setCurrentUser(user);
          setApproved(approved || false);
        } else {
          await setDoc(userRef, {
            approved: false,
            requestedAt: serverTimestamp(),
          });
          setCurrentUser(user);
          setApproved(false);
        }
      } else {
        setCurrentUser(null);
        setApproved(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ currentUser, approved, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


