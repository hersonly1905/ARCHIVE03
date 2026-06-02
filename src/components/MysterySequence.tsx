/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Heart, Sparkles, AlertCircle, ArrowDown, RefreshCw } from 'lucide-react';
import { poemLines } from '../data';
import { audioController } from '../utils/audioEngine';

interface MysterySequenceProps {
  onBackToTimeline: () => void;
}

export function MysterySequence({ onBackToTimeline }: MysterySequenceProps) {
  const [internalPhase, setInternalPhase] = useState<'LOADING' | 'POEM_REVEAL'>('LOADING');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Decrypting the core coordinates...");
  
  const petalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // loading text triggers
  useEffect(() => {
    if (internalPhase !== 'LOADING') return;

    const messages = [
      "Securing romantic connection protocols...",
      "Decrypting core emotional database...",
      "Weaving 3-month timeline tapestry...",
      "Opening personal love letter capsule...",
      "Initiating 'Be Intehaan' soundscape waves..."
    ];

    let msgIdx = 0;
    const txtTimer = setInterval(() => {
      if (msgIdx < messages.length) {
        setLoadingText(messages[msgIdx]);
        msgIdx++;
      }
    }, 1100);

    return () => clearInterval(txtTimer);
  }, [internalPhase]);

  // loading progress accumulation
  useEffect(() => {
    if (internalPhase !== 'LOADING') return;

    let timer: any;
    const updateProgress = () => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Transition to Poem screen with a gorgeous, delicate chime chime
          setTimeout(() => {
            setInternalPhase('POEM_REVEAL');
            audioController.setMood('poem');
            audioController.playSparkleNote(783.99, 3.0); // G5 chime chord
            audioController.playSparkleNote(987.77, 3.5); // B5 chime chord
          }, 600);
          return 100;
        }
        // Suspense curve loading increments
        const add = Math.floor(Math.random() * 5) + 3;
        return Math.min(prev + add, 100);
      });
    };

    timer = setInterval(updateProgress, 140);
    return () => clearInterval(timer);
  }, [internalPhase]);

  // Petals Confetti Rain Engine at the grand finale
  useEffect(() => {
    if (internalPhase !== 'POEM_REVEAL') return;

    const canvas = petalCanvasRef.current;
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

    // Rose petals variables
    const petals: Array<{
      x: number;
      y: number;
      r: number;
      length: number;
      width: number;
      opacity: number;
      speedY: number;
      swingSpeed: number;
      swingRange: number;
      swingAngle: number;
      color: string;
    }> = [];

    const roseColors = [
      'rgba(255, 61, 96, ',  // Luxury Rose Pink
      'rgba(197, 160, 89, ',  // Luxury Gold
      'rgba(251, 113, 133, ', // Rose 400
      'rgba(253, 164, 175, ', // Rose 300
      'rgba(255, 61, 96, '   // Luxury Rose Pink pure
    ];

    const createPetal = (startY?: number) => {
      return {
        x: Math.random() * canvas.width,
        y: startY !== undefined ? startY : -15,
        r: Math.random() * 4 + 4,
        length: Math.random() * 8 + 6,
        width: Math.random() * 6 + 4,
        opacity: Math.random() * 0.65 + 0.35,
        speedY: Math.random() * 1.5 + 0.8,
        swingSpeed: Math.random() * 0.02 + 0.01,
        swingRange: Math.random() * 1.5 + 0.5,
        swingAngle: Math.random() * Math.PI,
        color: roseColors[Math.floor(Math.random() * roseColors.length)]
      };
    };

    // Pre-populate petals so they pre-exist on screen
    for (let i = 0; i < 45; i++) {
      petals.push(createPetal(Math.random() * canvas.height));
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petals.forEach((p, idx) => {
        p.y += p.speedY;
        p.swingAngle += p.swingSpeed;
        p.x += Math.sin(p.swingAngle) * p.swingRange;

        // If falls below floor, reset
        if (p.y > canvas.height + 20) {
          petals[idx] = createPetal();
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.swingAngle * 0.4);

          // Draw realistic soft organic falling heart-shaped rose petal
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-p.width, -p.length / 2, -p.width, p.length / 2, 0, p.length);
          ctx.bezierCurveTo(p.width, p.length / 2, p.width, -p.length / 2, 0, 0);
          
          ctx.fillStyle = `${p.color}${p.opacity})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(255, 61, 96, 0.4)';
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [internalPhase]);

  // Framer Motion Scroll Trigger to gradually brighten background on bottom scroll arrive
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef
  });

  const finalMessageOpacity = useTransform(scrollYProgress, [0.82, 0.95], [0, 1]);
  const finalMessageScale = useTransform(scrollYProgress, [0.82, 0.95], [0.95, 1]);
  const backdropGlow = useTransform(scrollYProgress, [0.5, 0.95], ["rgba(0,0,0,0)", "rgba(255, 61, 96, 0.1)"]);

  // Group poem arrays into paragraphs/stanzas by splitting at empty lines
  const groupStanzas = () => {
    const list: string[][] = [];
    let active: string[] = [];
    poemLines.forEach((line) => {
      if (line === "") {
        if (active.length > 0) {
          list.push(active);
          active = [];
        }
      } else {
        active.push(line);
      }
    });
    if (active.length > 0) {
      list.push(active);
    }
    return list;
  };

  const poemStanzas = groupStanzas();

  return (
    <div className="relative w-full h-screen bg-obsidian text-stone-100 overflow-hidden" id="mystery-sequence">
      {/* Background elements */}
      <div className="atmosphere z-0 opacity-80" />
      <div className="cinematic-vignette z-0" />

      {/* Absolute background visual helper */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0 transition-colors duration-1000"
        style={{ backgroundColor: backdropGlow }}
      />

      <AnimatePresence mode="wait">
        
        {/* PHASE 4A: THE MYSTERY SUSPENSE DECRYPTING LOADING */}
        {internalPhase === 'LOADING' && (
          <motion.div
            key="mystery-loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-obsidian px-6 text-center select-none"
            id="mystery-loading-viewport"
          >
            {/* Ambient theme filters */}
            <div className="atmosphere z-0 opacity-70" />
            <div className="cinematic-vignette z-0" />

            {/* Pulsing ring of dramatic suspense */}
            <div className="relative mb-8 z-10">
              <motion.div 
                className="absolute -inset-4 rounded-full bg-luxury-rose/10 blur-xl"
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0.7, 0.3] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2.2, 
                  ease: "easeInOut" 
                }}
              />
              <div className="w-24 h-24 rounded-full border border-luxury-rose/25 flex items-center justify-center bg-neutral-950/60 relative glow-pulse shadow-2xl">
                <Heart className="w-10 h-10 text-luxury-rose fill-luxury-rose/10 animate-pulse" />
              </div>
            </div>

            <motion.h3 
              className="text-lg font-mono tracking-[0.25em] text-[#c5a059] font-semibold mb-2 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              UNFOLDING CRITICAL CODE
            </motion.h3>

            <motion.p 
              className="text-xs text-stone-300 font-mono tracking-widest max-w-xs uppercase mb-8 h-8 z-10 font-bold"
              key={loadingText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.8, y: 0 }}
            >
              {loadingText}
            </motion.p>

            {/* Suspense Digital Timer Box */}
            <div className="p-4 rounded-xl bg-neutral-950/90 border border-white/5 w-64 shadow-2xl glass z-11">
              <div className="flex justify-between items-center mb-2 text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                <span>Memory byte stack</span>
                <span>unlocked</span>
              </div>
              <div className="text-4xl font-mono font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-luxury-rose to-luxury-gold tracking-tight">
                {String(loadingProgress).padStart(3, '0')}%
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 4B: POEM AND ANNIVERSARY GRAND REVEAL PARALLAX */}
        {internalPhase === 'POEM_REVEAL' && (
          <motion.div
            key="poem-scroller"
            ref={scrollContainerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-30 overflow-y-auto scrollbar-hide py-12 px-6 flex flex-col"
            id="poem-scroller-viewport"
          >
            {/* Live Petal Storm canvas as background */}
            <canvas ref={petalCanvasRef} className="fixed inset-0 w-full h-full block pointer-events-none z-0" />

            {/* Floating back button */}
            <div className="fixed top-6 left-6 z-40">
              <button
                id="poem-back-to-timelines"
                onClick={onBackToTimeline}
                className="flex items-center gap-2 px-4 py-2 bg-[#050304]/80 hover:bg-neutral-950 backdrop-blur-md rounded-full border border-[#c5a059]/30 hover:border-luxury-rose/50 text-xs text-stone-300 hover:text-white cursor-pointer transition-all duration-300 shadow-xl glass"
              >
                <RefreshCw className="w-3.5 h-3.5 text-luxury-rose rotate-45" />
                <span>Return to Cosmos</span>
              </button>
            </div>

            {/* LETTER HEADER */}
            <div className="relative z-10 max-w-xl mx-auto text-center mt-12 mb-16 select-none">
              <span className="text-[10px] font-mono tracking-[0.4em] text-[#c5a059]/80 uppercase font-bold">
                Chapter IV — Whisper from the Heart
              </span>
              <h2 className="text-3xl font-extralight tracking-tight font-serif text-white mt-1 filter drop-shadow italic">
                Handwritten to my Cosmic Star
              </h2>
              <div className="w-12 h-[1px] bg-white/10 mx-auto mt-4" />
            </div>

            {/* STANZA ROWS */}
            <div className="relative z-10 max-w-xl mx-auto w-full flex flex-col gap-12 mb-28">
              {poemStanzas.map((stanza, sIdx) => (
                <motion.div
                  key={sIdx}
                  className="flex flex-col items-center gap-3.5 text-center px-4"
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 0.95, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.9, delay: sIdx * 0.15 }}
                >
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-luxury-rose/40 fill-luxury-rose/5" />
                  </div>

                  {stanza.map((line, lIdx) => (
                    <p
                       key={lIdx}
                       className="text-stone-300 font-cursive text-xl tracking-wide leading-relaxed filter drop-shadow-sm font-light"
                    >
                      {line}
                    </p>
                  ))}
                </motion.div>
              ))}
            </div>

            {/* Dynamic Scroll Notice Indicator to guide users */}
            <div className="flex flex-col items-center justify-center text-center mt-12 mb-20 relative z-10 select-none opacity-40 hover:opacity-80 transition-opacity">
              <p className="text-[10px] font-mono tracking-[0.3em] text-[#c5a059] uppercase">
                Scroll downwards for the climax
              </p>
              <ArrowDown className="w-4 h-4 text-luxury-rose animate-bounce mt-2.5" />
            </div>

            {/* THE CLIMAX GRAND VALENTINE REVEAL CONTAINER */}
            <div className="min-h-screen flex flex-col justify-center items-center relative z-10 py-12 text-center w-full max-w-3xl mx-auto">
              
              {/* Glowing halo crown background */}
              <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-luxury-rose/10 via-luxury-gold/5 to-luxury-rose/10 blur-3xl pointer-events-none" />

              <motion.div
                id="happy-anniversary-reveal-title"
                style={{ 
                  opacity: finalMessageOpacity,
                  scale: finalMessageScale
                }}
                className="flex flex-col items-center justify-center p-8 rounded-3xl bg-[#050304]/60 border border-luxury-gold/30 backdrop-blur-md shadow-2xl relative glass"
              >
                {/* Floating Heart Star Rings */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-luxury-rose/20 via-luxury-gold/15 to-luxury-rose/20 rounded-3xl -z-10 pointer-events-none" />

                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-full bg-luxury-rose/15 text-luxury-rose flex items-center justify-center mb-6 border border-luxury-rose/30 shadow-lg glow-pulse"
                >
                  <Heart className="w-7 h-7 fill-luxury-rose/25" />
                </motion.div>

                <p className="text-[10px] text-[#c5a059] uppercase tracking-[0.4em] font-mono mb-2 font-semibold">
                  Our Three Month Landmark
                </p>

                <h1 className="text-5xl md:text-6xl font-extralight tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-stone-50 via-stone-200 to-[#c5a059] font-serif leading-none pb-2 h-auto italic">
                  HAPPY 3 MONTHS <br />
                  <span className="font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-luxury-rose via-luxury-rose to-luxury-gold font-sans not-italic">
                    ANNIVERSARY
                  </span>
                </h1>

                <p className="max-w-md text-stone-300 font-light text-md italic mt-6 leading-relaxed font-cursive px-4 tracking-wider">
                  "Every single heartbeat, every shared twilight walk, and every cozy laugh in the coffee house. Thank you for these ninety days of sheer magic. This is only the baseline of our infinite story."
                </p>

                <div className="flex gap-1 bg-black/80 px-4 py-1.5 rounded-full border border-white/5 font-mono text-[9px] text-[#c5a059] tracking-widest uppercase mt-8 select-none">
                  <Sparkles className="w-3 h-3 text-luxury-rose animate-spin-slow mr-1" />
                  <span>Permanent memory vault successfully synchronized</span>
                </div>
              </motion.div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
