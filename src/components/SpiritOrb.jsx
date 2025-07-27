import { motion } from "framer-motion";
import "./SpiritOrb.css";

const SpiritOrb = () => {
  return (
    <motion.div
      className="spirit-orb"
      animate={{
        y: [0, -20, 0],
        x: [0, 10, -10, 0],
        rotate: [0, 360],
      }}
      transition={{
        duration: 6,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    />
  );
};

export default SpiritOrb;
