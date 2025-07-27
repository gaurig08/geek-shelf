import React, { useRef, useEffect } from "react";

const FirefliesCanvas = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fireflies = [];

    const numFireflies = 50;

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
        ctx.fillStyle = `rgba(255, 223, 100, ${this.alpha})`; // golden glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(255, 255, 180, 0.8)";
        ctx.fill();
      }
    }

    for (let i = 0; i < numFireflies; i++) {
      fireflies.push(new Firefly());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      fireflies.forEach((f) => {
        f.update();
        f.draw();
      });
      requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1,
        pointerEvents: "none", // don't block clicks
      }}
    />
  );
};

export default FirefliesCanvas;


