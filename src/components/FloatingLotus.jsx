// components/FloatingLotus.jsx
import { motion } from "framer-motion";
import "./FloatingLotus.css";

const FloatingLotus = () => {
  return (
    <motion.div
      className="lotus-container"
      animate={{
        y: [0, -20, 0],
        rotate: [0, 1.5, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        className="lotus-svg"
        width="100"
        height="100"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#F4B3E8" stroke="#E48BCA" strokeWidth="2">
          <path d="M100,30 C90,70 70,90 50,100 C70,110 90,130 100,170 C110,130 130,110 150,100 C130,90 110,70 100,30 Z" />
          <path d="M100,30 C100,60 110,70 130,80 C110,90 100,100 100,130 C90,100 80,90 70,80 C90,70 100,60 100,30 Z" opacity="0.8"/>
        </g>
      </svg>
    </motion.div>
  );
};

export default FloatingLotus;
