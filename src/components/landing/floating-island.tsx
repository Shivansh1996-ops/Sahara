"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function FloatingIsland() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      };
      targetRotation.current = {
        x: mousePos.current.y * 20,
        y: mousePos.current.x * 20,
      };
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    // Island components
    const time = { value: 0 };

    // Draw functions
    const drawIsland = (offsetX: number, offsetY: number, scale: number) => {
      ctx.save();
      ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
      
      // Apply rotation
      ctx.rotate((currentRotation.current.y * Math.PI) / 180);
      
      // Island base (dark brown rock)
      ctx.fillStyle = "#4a3728";
      ctx.beginPath();
      ctx.ellipse(0, 20 * scale, 120 * scale, 40 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Island top layers
      const layers = [
        { y: 10, rx: 110, ry: 35, color: "#5a4738" },
        { y: 0, rx: 100, ry: 30, color: "#6a5748" },
        { y: -10, rx: 90, ry: 25, color: "#7a6758" },
      ];

      layers.forEach((layer) => {
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.ellipse(0, layer.y * scale, layer.rx * scale, layer.ry * scale, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grass top
      ctx.fillStyle = "#7a9a6b";
      ctx.beginPath();
      ctx.ellipse(0, -15 * scale, 85 * scale, 20 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Add some texture
      ctx.fillStyle = "#6a8a5b";
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 70 * scale;
        const y = -15 * scale + Math.sin(angle) * 15 * scale;
        ctx.beginPath();
        ctx.arc(x, y, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const drawTree = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);

      // Trunk
      ctx.fillStyle = "#5a4738";
      ctx.fillRect(-5 * scale, -20 * scale, 10 * scale, 30 * scale);

      // Foliage (3 circles)
      const foliageColors = ["#7a9a6b", "#6a8a5b", "#5a7a4b"];
      foliageColors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, -30 * scale - i * 8 * scale, 15 * scale - i * 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    const drawMountain = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);

      // Mountain body
      ctx.fillStyle = "#8a7a6a";
      ctx.beginPath();
      ctx.moveTo(0, -50 * scale);
      ctx.lineTo(-30 * scale, 10 * scale);
      ctx.lineTo(30 * scale, 10 * scale);
      ctx.closePath();
      ctx.fill();

      // Snow cap
      ctx.fillStyle = "#f0f0f0";
      ctx.beginPath();
      ctx.moveTo(0, -50 * scale);
      ctx.lineTo(-15 * scale, -25 * scale);
      ctx.lineTo(15 * scale, -25 * scale);
      ctx.closePath();
      ctx.fill();

      // Shadow
      ctx.fillStyle = "#7a6a5a";
      ctx.beginPath();
      ctx.moveTo(0, -50 * scale);
      ctx.lineTo(30 * scale, 10 * scale);
      ctx.lineTo(15 * scale, 10 * scale);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const drawWaterfall = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);

      // Water stream
      const gradient = ctx.createLinearGradient(0, 0, 0, 60 * scale);
      gradient.addColorStop(0, "rgba(130, 184, 218, 0.6)");
      gradient.addColorStop(1, "rgba(130, 184, 218, 0.2)");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(-8 * scale, 0, 16 * scale, 60 * scale);

      // Water splash at bottom
      ctx.fillStyle = "rgba(130, 184, 218, 0.4)";
      ctx.beginPath();
      ctx.ellipse(0, 60 * scale, 20 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawCloud = (x: number, y: number, scale: number, offset: number) => {
      ctx.save();
      ctx.translate(x, y + Math.sin(time.value + offset) * 5);

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      
      // Cloud circles
      const circles = [
        { x: -15, y: 0, r: 12 },
        { x: 0, y: -5, r: 15 },
        { x: 15, y: 0, r: 12 },
        { x: 0, y: 5, r: 10 },
      ];

      circles.forEach((circle) => {
        ctx.beginPath();
        ctx.arc(circle.x * scale, circle.y * scale, circle.r * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      time.value += 0.02;

      // Smooth rotation interpolation
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.1;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.1;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Floating animation
      const floatOffset = Math.sin(time.value) * 10;

      // Draw clouds (background)
      drawCloud(canvas.width * 0.2, canvas.height * 0.2, 1, 0);
      drawCloud(canvas.width * 0.7, canvas.height * 0.15, 0.8, 1);
      drawCloud(canvas.width * 0.5, canvas.height * 0.25, 1.2, 2);

      // Draw main island
      drawIsland(0, floatOffset, 1);

      // Draw mountains on island
      drawMountain(-40, floatOffset - 20, 0.8);
      drawMountain(50, floatOffset - 15, 0.6);

      // Draw trees
      drawTree(-60, floatOffset - 10, 0.8);
      drawTree(-30, floatOffset - 5, 1);
      drawTree(30, floatOffset - 8, 0.9);
      drawTree(70, floatOffset - 5, 0.7);

      // Draw waterfall
      drawWaterfall(90, floatOffset + 10, 1);

      // Draw foreground clouds
      drawCloud(canvas.width * 0.85, canvas.height * 0.7, 0.9, 3);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateSize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative w-full h-full"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-move"
        style={{ touchAction: "none" }}
      />
      
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {/** Generate particle values on mount to avoid impure calls during render */}
        <Particles />
      </div>
    </motion.div>
  );
}

function Particles() {
  const [particles, setParticles] = useState<Array<{ left: string; top: string; duration: number; delay: number }>>([]);

  useEffect(() => {
    const list = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setTimeout(() => setParticles(list), 0);
  }, []);

  return <>{particles.map((p, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-white/30 rounded-full"
      style={{ left: p.left, top: p.top }}
      animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3], scale: [1, 1.5, 1] }}
      transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
    />
  ))}</>;
}
