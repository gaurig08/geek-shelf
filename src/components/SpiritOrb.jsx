import { motion } from "framer-motion";
import "./SpiritOrb.css";

const SpiritOrb = () => {
  return (
    <motion.div
  className="spirit-orb"
  style={{
    position: "absolute",
    top: "10px",
    left: "80px", // Move it more to the left
  }}
  animate={{
    y: [0, -40, 0],
    x: [0, -20, 20, 0],
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

export default SpiritOrb;
