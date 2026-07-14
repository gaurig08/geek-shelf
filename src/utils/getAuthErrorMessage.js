// src/utils/getAuthErrorMessage.js
//
// Maps Firebase Auth error codes to human-readable messages.
// Firebase's raw err.message looks like "Firebase: Error (auth/wrong-password)."
// which is not something to show a user.

const MESSAGES = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};

export const getAuthErrorMessage = (error) => {
  const code = error?.code || "";
  return MESSAGES[code] || "Something went wrong. Please try again.";
};
