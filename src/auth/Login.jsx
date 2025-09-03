import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const checkApprovalAndNavigate = async (user) => {
    try {
     if (!user) {
        setError("User object is null or undefined.");
        await signOut(auth);
        return false;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("Account does not exist in the database.");
        await signOut(auth);
        return false;
      }

      const userData = userSnap.data();
// REMOVED: console.log("Fetched user data:", userData);
 // A more explicit check to ensure 'approved' is a boolean and is true
      if (!userData || typeof userData.approved !== 'boolean' || !userData.approved) {
        setError("Your account is pending approval.");
        await signOut(auth);
        return false;
      }

      navigate("/"); // approved -> go home
      return true;
    } catch (err) {
      console.error("Error during approval check:", err);
      setError("Error checking account approval. Please try again later.");
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
     const userCredential = await signInWithEmailAndPassword(auth, email, password);
     await checkApprovalAndNavigate(userCredential.user);
    } catch (err) {
      console.error(err);
      setError(err.message);
   }
  };

  const handleGoogleLogin = async () => {
   setError("");
    try {
     const provider = new GoogleAuthProvider();
     const result = await signInWithPopup(auth, provider);
     await checkApprovalAndNavigate(result.user);
   } catch (err) {
     console.error(err);
     setError(err.message);
   }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Log In</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Log In</button>

       <div className="or-separator">OR</div>

        <div className="google-btn" onClick={handleGoogleLogin}>
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




