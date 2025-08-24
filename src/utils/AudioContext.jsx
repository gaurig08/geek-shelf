import { createContext, useContext, useEffect, useRef, useState } from "react";
import ambientAudio from "/sounds/ambient.mp3"; // ✅ adjust path if needed

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(ambientAudio);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    const playOnFirstClick = () => {
      audioRef.current.play();
      setIsPlaying(true);
      document.removeEventListener("click", playOnFirstClick);
    };

    // Try autoplay
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      // Autoplay blocked, wait for interaction
      document.addEventListener("click", playOnFirstClick);
    });

    return () => {
      audioRef.current.pause();
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;

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
