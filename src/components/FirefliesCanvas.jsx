import React, { useRef, useEffect } from "react";

const FirefliesCanvas = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set initial size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    // Debounced resize
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setCanvasSize();
      }, 200);
    };
    window.addEventListener("resize", handleResize);

    const fireflies = [];
    const numFireflies = Math.min(50, Math.floor(window.innerWidth / 50)); // Responsive

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isLowPower = prefersReducedMotion;

    class Firefly {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 1.5 + 1;
        this.alpha = Math.random() * 0.5 + 0.5;
        this.angle = Math.random() * 2 * Math.PI;
        this.speed = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.angle += (Math.random() - 0.5) * 0.1;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (
          this.x < 0 ||
          this.x > canvas.width ||
          this.y < 0 ||
          this.y > canvas.height
        ) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 223, 100, ${this.alpha})`;
        if (!isLowPower) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(255, 255, 180, 0.8)";
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
    }

    for (let i = 0; i < numFireflies; i++) {
      fireflies.push(new Firefly());
    }

    let animationRunning = true;

    const animate = () => {
      if (!animationRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      fireflies.forEach((f) => {
        f.update();
        f.draw();
      });

      if ("requestIdleCallback" in window) {
        requestIdleCallback(animate);
      } else {
        setTimeout(animate, 1000 / 30); // fallback ~30fps
      }
    };

    animate();

    // Pause when tab is hidden
    const handleVisibilityChange = () => {
      animationRunning = !document.hidden;
      if (animationRunning) animate();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      animationRunning = false;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
};

export default FirefliesCanvas;
