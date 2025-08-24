import { motion } from "framer-motion";
import "./SpiritOrb.css";

const SpiritOrb1 = () => {
  return (
    <motion.div
  className="spirit-orb"
  style={{
    position: "absolute",
    top: "-30px",
    left: "1200px", // Move it more to the left
  }}
  animate={{
    y: [0, -10, 0],
    x: [0, -50, 30, 0],
    rotate: [0, 360],
  }}
  transition={{
    duration: 10, // slower and smoother
    ease: "easeInOut",
    repeat: Infinity,
  }}
/>
  );
};

export default SpiritOrb1;