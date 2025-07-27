// App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import ShelfPage from "./pages/ShelfPage";
import ShelfItemDetailPage from "./pages/ShelfItemDetailPage";
import CategoryListPage from "./pages/CategoryListPage";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import NavBar from "./components/NavBar";
import AudioToggle from "./components/AudioToggle";
import FirefliesCanvas from "./components/FirefliesCanvas";
import ProtectedRoute from "./auth/PrivateRoute";
import { AuthProvider } from "./auth/AuthContext";
import "./styles.css";
import PageTransition from "./components/PageTransition";

const App = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <AuthProvider>
      {!isAuthPage && (
        <>
          <FirefliesCanvas />
          <AudioToggle />
          <NavBar />
        </>
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PageTransition><HomePage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <PageTransition><SearchPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelf"
            element={
              <ProtectedRoute>
                <PageTransition><ShelfPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelf/:category"
            element={
              <ProtectedRoute>
                <PageTransition><CategoryListPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelf/item/:itemId"
            element={
              <ProtectedRoute>
                <PageTransition><ShelfItemDetailPage /></PageTransition>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
};

export default App;

