// components/PageTransition.jsx
import { motion } from "framer-motion";

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      style={{ width: "100%", minHeight: "100vh", overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;

