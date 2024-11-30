import React, { useEffect, useRef } from "react";

const ConceptArtLogin: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const width = canvas.width;
    const height = canvas.height;

    const gridSize = 30;
    const points = [];
    let mouseX = width / 2;
    let mouseY = height / 2;

    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        points.push({
          x,
          y,
          size: Math.random() * 2 + 1.5,
          opacity: Math.random() * 0.5 + 0.4,
          isActive: false,
          activeTime: 0,
          activationProgress: 0,
        });
      }
    }

    const activateRandomPoints = () => {
      const randomPoint = points[Math.floor(Math.random() * points.length)];
      if (!randomPoint.isActive) {
        randomPoint.isActive = true;
        randomPoint.activeTime = Math.random() * 2000 + 500;
      }
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#000000");
      gradient.addColorStop(1, "#111111");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      points.forEach((point) => {
        const dx = point.x - mouseX;
        const dy = point.y - mouseY;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);

        const oscillation = Math.sin((time + distance) * 0.004);
        let size = Math.max(0.1, point.size + oscillation * 1.5);
        let opacity = Math.max(0.2, point.opacity + oscillation * 0.5);

        if (point.isActive) {
          point.activationProgress = Math.min(1, point.activationProgress + 0.01);
          size += point.activationProgress * 1.5;
          opacity += point.activationProgress * 0.5;
          point.activeTime -= 16.67;
          if (point.activeTime <= 0) {
            point.isActive = false;
            point.activationProgress = 0;
          }
        }

        const maxInteractionDistance = 90;
        const interactionEffect = Math.max(0, maxInteractionDistance - distance) / maxInteractionDistance;
        if (distance < maxInteractionDistance) {
          size += interactionEffect * 4;
          opacity += interactionEffect * 0.5;
        }

        const gray = Math.min(255, Math.max(50, Math.floor((1 - distance / 500) * 255)));
        ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${opacity})`;

        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    const animate = (time: number) => {
      draw(time);
      requestAnimationFrame(animate);
    };

    animate(0);

    const randomActivationLoop = () => {
      activateRandomPoints();
      requestAnimationFrame(randomActivationLoop);
    };
    randomActivationLoop();

    canvas.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", () => {});
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />;
};

export default ConceptArtLogin;
