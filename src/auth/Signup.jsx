import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Auth.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const createUserDoc = async (userEmail, userId) => {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        email: userEmail || "no-email@unknown.com", // fallback in case email is null
        approved: false,
        requestedAt: serverTimestamp(),
      });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDoc(userCredential.user.email, userCredential.user.uid);

      alert("Signup successful! Your account is pending approval.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await createUserDoc(user.email, user.uid);

      alert("Signup successful! Your account is pending approval.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSignup} className="auth-form">
        <h2>Sign Up</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Sign Up</button>

        <div className="or-separator">OR</div>

        <div className="google-btn" onClick={handleGoogleSignup}>
          <img src="/signup.svg" alt="Google" />
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
