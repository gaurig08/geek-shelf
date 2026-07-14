import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { getAuthErrorMessage } from "../utils/getAuthErrorMessage";
import "./Auth.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const createUserDoc = async (userEmail, userId) => {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        email: userEmail || "no-email@unknown.com", // fallback in case email is null
        joinedAt: serverTimestamp(),
      });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDoc(userCredential.user.email, userCredential.user.uid);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserDoc(result.user.email, result.user.uid);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSignup} className="auth-form">
        <h2>Sign Up</h2>
        <input
          type="email"
          id="signup-email"
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
          id="signup-password"
          name="password"
          autoComplete="new-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={submitting}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Signing up..." : "Sign Up"}
        </button>

        <div className="or-separator">OR</div>

        <div
          className={`google-btn ${submitting ? "disabled" : ""}`}
          onClick={submitting ? undefined : handleGoogleSignup}
        >
          <img src="/signup.webp" alt="Google" />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <p>
          Already have an account? <span className="auth-link" onClick={() => navigate("/login")}>Log In</span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
