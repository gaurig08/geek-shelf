import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [theme, setTheme] = useState("night"); // matches the site's original default

  // Load the user's saved preference once they're signed in. Falls back
  // to "night" if they've never set one (new users, or a doc that
  // predates this feature).
  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        const saved = snap.data()?.theme;
        if (saved === "day" || saved === "night") setTheme(saved);
      } catch (err) {
        console.warn("Could not load theme preference:", err);
      }
    };
    load();
  }, [currentUser]);

  // Reflect the current theme on <html> so theme.css's attribute
  // selectors apply everywhere, including outside the React root.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = async () => {
    const next = theme === "night" ? "day" : "night";
    setTheme(next); // optimistic - don't make the UI wait on the write

    if (!currentUser) return;
    try {
      await setDoc(doc(db, "users", currentUser.uid), { theme: next }, { merge: true });
    } catch (err) {
      console.warn("Could not save theme preference:", err);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
