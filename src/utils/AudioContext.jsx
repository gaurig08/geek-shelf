import { createContext, useContext, useEffect, useRef, useState } from "react";
import ambientAudio from "/sounds/ambient.mp3"; // ✅ adjust path if needed

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Detect mobile device
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    if (isMobile) {
      // 🚫 Disable audio completely on mobile
      return;
    }

    audioRef.current = new Audio(ambientAudio);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    const playOnFirstClick = () => {
      audioRef.current.play();
      setIsPlaying(true);
      document.removeEventListener("click", playOnFirstClick);
    };

    // Try autoplay
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        // Autoplay blocked, wait for interaction
        document.addEventListener("click", playOnFirstClick);
      });

    return () => {
      audioRef.current?.pause();
    };
  }, [isMobile]);

  const toggleAudio = () => {
    if (!audioRef.current || isMobile) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, toggleAudio }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);

