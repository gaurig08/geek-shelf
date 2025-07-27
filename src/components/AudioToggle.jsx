import { useState, useRef, useEffect } from "react";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";

const AudioToggle = () => {
  const [isPlaying, setIsPlaying] = useState(false); // Default to muted if autoplay fails
  const audioRef = useRef(new Audio("/sounds/ambient.mp3"));

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.5;

    const tryPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true); // Update state only if playback starts
      } catch (err) {
        // Autoplay blocked, wait for user interaction
        const handleFirstClick = () => {
          audio.play();
          setIsPlaying(true); // Update state when user clicks
          document.removeEventListener("click", handleFirstClick);
        };
        document.addEventListener("click", handleFirstClick);
      }
    };

    tryPlay();

    return () => {
      audio.pause();
    };
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

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

