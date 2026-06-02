/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { audioController } from '../utils/audioEngine';

interface LoadingScreenProps {
  onComplete: () => void;
}

const emotionalSteps = [
  "Tracing the golden threads...",
  "Loading memories...",
  "Gathering smiles and late-night talks...",
  "Preparing the time travel...",
  "Forging cozy coffee dreams...",
  "Opening our story..."
];

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Shifting text every 1.5 seconds
  useEffect(() => {
    const textInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % emotionalSteps.length);
    }, 1800);
    return () => clearInterval(textInterval);
  }, []);

  // Soft progress acceleration
  useEffect(() => {
    let timer: any;
    const increment = () => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsLoaded(true);
          clearInterval(timer);
          return 100;
        }
        // Organic progress speed up / slow down
        const add = Math.floor(Math.random() * 8) + 3;
        const next = Math.min(prev + add, 100);
        if (next === 100) {
          setIsLoaded(true);
        }
        return next;
      });
    };
    timer = setInterval(increment, 160);
    return () => clearInterval(timer);
  }, []);

  // Floating starry dust particles in canvas
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Warm rose, peach, and golden romantic stars
    const particles: Array<{
      x: number;
      y: number;
      r: number;
      speedY: number;
      speedX: number;
      alpha: number;
      decay: number;
      color: string;
    }> = [];

    const colors = [
      'rgba(255, 61, 96, ',  // Luxury Rose
      'rgba(197, 160, 89, ', // Luxury Gold
      'rgba(217, 70, 239, ', // Fuchsia highlight
      'rgba(253, 244, 245, ' // Warm Offwhite
    ];

    const createParticle = (xPos?: number, yPos?: number) => {
      return {
        x: xPos !== undefined ? xPos : Math.random() * canvas.width,
        y: yPos !== undefined ? yPos : canvas.height + 10,
        r: Math.random() * 2.5 + 0.8,
        speedY: -(Math.random() * 1.5 + 0.6),
        speedX: (Math.random() - 0.5) * 0.8,
        alpha: Math.random() * 0.5 + 0.3,
        decay: Math.random() * 0.005 + 0.002,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    };

    // Populate stars initially
    for (let i = 0; i < 60; i++) {
      particles.push(createParticle(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark obsidian base
      ctx.fillStyle = '#050304';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render drifting timelines
      particles.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y < -10) {
          particles[idx] = createParticle();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha})`;
          ctx.shadowBlur = p.r * 3;
          ctx.shadowColor = 'rgba(255, 61, 96, 0.4)';
          ctx.fill();
        }
      });
      
      // Reset shadow effects
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleBegin = () => {
    // Initialise audio on user gesture
    audioController.init();
    audioController.playSparkleNote(523.25, 2.5); // Warm initial chime
    audioController.playSparkleNote(659.25, 2.0); // Warm E note
    audioController.playSparkleNote(783.99, 3.0); // Warm G chime
    onComplete();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center select-none bg-obsidian" id="loading-screen">
      {/* Background Stardust Canvas */}
      <canvas ref={particleCanvasRef} className="absolute inset-0 w-full h-full block z-0" />

      {/* Atmospheric Radial Gradients and Cinematic Vignette */}
      <div className="atmosphere z-10" />
      <div className="cinematic-vignette z-10" />

      {/* Primary Container */}
      <div className="relative z-20 flex flex-col items-center justify-center max-w-md px-6 text-center">
        
        {/* Memory Vault Header Details inside loading */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-[10px] uppercase tracking-[0.4em] text-stone-500 font-semibold">
            Memory Vault // Archive 03
          </span>
          <span className="font-serif text-3xl text-stone-200 mt-1 italic font-light">
            The Anniversary Journey
          </span>
        </div>

        {/* Glowing Heart Ring with Theme Gold/Rose configuration */}
        <motion.div 
          className="relative mb-8 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        >
          {/* Radial Light Leak Orbit */}
          <div className="absolute w-40 h-40 rounded-full bg-luxury-rose/10 blur-xl animate-pulse" />
          <div className="absolute w-28 h-28 rounded-full border border-luxury-rose/20 animate-[spin_10s_linear_infinite]" />
          <div className="absolute w-32 h-32 rounded-full border border-dashed border-luxury-gold/20 animate-[spin_25s_linear_infinite]" />
          
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-950 to-neutral-900 border border-luxury-rose/40 flex items-center justify-center shadow-2xl relative z-30 glow-pulse"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(255, 61, 96, 0.2)",
                "0 0 45px rgba(255, 61, 96, 0.45)",
                "0 0 20px rgba(255, 61, 96, 0.2)"
              ]
            }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <Heart className="w-8 h-8 text-luxury-rose fill-luxury-rose/20 animate-pulse" />
          </motion.div>
        </motion.div>

        {/* Dynamic transition text phrase */}
        <div className="h-14 w-80 relative flex items-center justify-center mb-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              className="absolute text-sm font-light text-stone-300 tracking-wide font-sans italic"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 0.95, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.6 }}
            >
              {emotionalSteps[stepIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Floating Custom Gold/Rose Progress Bar */}
        <div className="w-72 bg-neutral-950/90 rounded-full h-[6px] border border-white/5 relative p-[1px] mb-6 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-luxury-rose via-luxury-gold to-luxury-rose rounded-full relative"
            id="loading-bar-fill"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut" }}
          >
            {/* Sparkle tip of loading */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,61,96,0.8)]" />
          </motion.div>
        </div>

        {/* Loading status number */}
        <span className="text-[10px] font-mono tracking-widest text-[#c5a059]/80 uppercase font-medium">
          Synchronization thread: {progress}%
        </span>

        {/* Beautiful CTA appearing on load complete matches HTML prototype style */}
        <div className="h-16 mt-8 flex items-center justify-center w-full">
          <AnimatePresence>
            {isLoaded && (
              <motion.button
                id="enter-timeline-trigger"
                onClick={handleBegin}
                className="relative px-12 py-4 bg-black/40 backdrop-blur rounded-full text-[12px] text-stone-200 uppercase font-mono tracking-[0.3em] mystery-btn cursor-pointer overflow-hidden shadow-2xl hover:bg-rose-950/20 glow-pulse border border-[#c5a059]/30 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-2 font-semibold">
                  Begin Memory Journey
                  <Sparkles className="w-4 h-4 text-[#c5a059] animate-spin-slow" />
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Subtle Bottom Credits */}
      <div className="absolute bottom-6 left-0 right-0 z-20 text-center opacity-40">
        <p className="text-[10px] font-mono tracking-[0.3em] text-stone-400 uppercase">
          
        </p>
      </div>
    </div>
  );
}
