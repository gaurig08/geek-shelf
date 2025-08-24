import React from "react";
import { motion } from "framer-motion";
import "./HomePage.css"; // Add styling here


const HomePage = () => {
  return (
  
    <div className="home-container">
        
        <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Your background / cozy content here */}
      

    </div>
      <div className="overlay">
        <motion.h1
          className="cozy-title"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
        Welcome to GeekShelf
        </motion.h1>
        <motion.p
          className="cozy-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          
        </motion.p>
      </div>
    </div>
 
  );
};

export default HomePage;

