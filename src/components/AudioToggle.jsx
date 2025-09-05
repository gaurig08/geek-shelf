import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { useAudio } from "../utils/AudioContext";

const AudioToggle = () => {
  const { isPlaying, toggleAudio } = useAudio();

  // Detect if the user is on a mobile device
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // 🚫 Don’t render anything on mobile
  if (isMobile) return null;

  return (
    <button
      onClick={toggleAudio}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "12px",
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.8)",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        zIndex: 9999,
      }}
    >
      {isPlaying ? <FaVolumeUp size={24} /> : <FaVolumeMute size={24} />}
    </button>
  );
};

export default AudioToggle;
