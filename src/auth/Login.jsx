import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "./AuthProvider";
import { getAuthErrorMessage } from "../utils/getAuthErrorMessage";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { currentUser, authError } = useAuth();

  // AuthProvider is the single source of truth for whether sign-in
  // actually succeeded (it also enforces approval). Once it reports a
  // signed-in user, navigate home. If it reports an approval error,
  // surface that here instead of running our own separate check.
  useEffect(() => {
    if (currentUser) navigate("/");
  }, [currentUser, navigate]);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Success/failure past this point (approval, etc.) is handled by
      // AuthProvider and reflected via currentUser/authError above.
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Log In</h2>
        <input
          type="email"
          id="login-email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={submitting}
        />
        <input
          type="password"
          id="login-password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={submitting}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Log In"}
        </button>

        <div className="or-separator">OR</div>

        <div
          className={`google-btn ${submitting ? "disabled" : ""}`}
          onClick={submitting ? undefined : handleGoogleLogin}
        >
          <img src="/signin.webp" alt="Google" />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <p>
          Don't have an account? <span className="auth-link" onClick={() => navigate("/signup")}>Sign Up</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
