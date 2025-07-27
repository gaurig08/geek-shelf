import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase"; // ✅ Corrected imports

import "./Auth.css"; // Make sure this exists

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ✅ Check whitelist
      const whitelistRef = collection(db, "whitelist");
      const snapshot = await getDocs(whitelistRef);
      const allowedEmails = snapshot.docs.map((doc) => doc.id);

      if (!allowedEmails.includes(email)) {
        setError("This email is not approved for sign-up.");
        return;
      }

      // ✅ Sign up
      await createUserWithEmailAndPassword(auth, email, password);

      // ✅ Navigate to login
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSignup} className="auth-form">
        <h2>Sign Up</h2>
  
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
  
        <button type="submit">Sign Up</button>
  
        {error && <p className="auth-error">{error}</p>}
  
        {/* 🔁 Moved outside the error condition */}
        <p>
          Already have an account?{" "}
          <span className="auth-link" onClick={() => navigate("/login")}>
            Log In
          </span>
        </p>
      </form>
    </div>
  );
  
};

export default Signup;





