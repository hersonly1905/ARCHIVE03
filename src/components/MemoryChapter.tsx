/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Music, Heart, Calendar } from 'lucide-react';
import { MonthData } from '../types';
import { audioController } from '../utils/audioEngine';

interface MemoryChapterProps {
  month: MonthData;
  onBackToTimeline: () => void;
}

export function MemoryChapter({ month, onBackToTimeline }: MemoryChapterProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [flowElements, setFlowElements] = useState<Array<{ id: number; left: number; delay: number; scale: number; speed: number }>>([]);

  // Sync music mood on mount
  useEffect(() => {
    audioController.setMood(month.musicMood);
  }, [month]);

  // Generate floating atmospheric flow items depending on the chapter vibe
  useEffect(() => {
    const symbolsCount = 15;
    const items = [...Array(symbolsCount)].map((_, idx) => ({
      id: idx,
      left: Math.random() * 92 + 4, // keep inside viewport padded zone
      delay: Math.random() * 8,
      scale: Math.random() * 0.7 + 0.5,
      speed: Math.random() * 15 + 15 // seconds
    }));
    setFlowElements(items);
  }, [month.id]);

  const handleNext = () => {
    setDirection('right');
    setActiveImageIndex((prev) => (prev + 1) % month.images.length);
    audioController.playSparkleNote(440 * (1 + activeImageIndex * 0.1), 0.8);
  };

  const handlePrev = () => {
    setDirection('left');
    setActiveImageIndex((prev) => (prev === 0 ? month.images.length - 1 : prev - 1));
    audioController.playSparkleNote(330 * (1 + activeImageIndex * 0.1), 0.8);
  };

  // Slideshow keyboard navigation assistance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex]);

  // Floating Symbol Renderer
  const renderFloatingSymbol = (idx: number) => {
    if (month.id === 1) {
      // Month 1 has soft pink rose petals / hearts
      return idx % 2 === 0 ? '🌸' : '💖';
    } else if (month.id === 2) {
      // Month 2 has warm orange glowing embers / cozy balloons
      return idx % 2 === 0 ? '✨' : '🎈';
    } else {
      // Month 3 has rich violet sparkling magical stars
      return idx % 2 === 0 ? '🌌' : '💜';
    }
  };

  // Image slide variants matching time tunnel motif
  const slideVariants = {
    initial: (dir: 'left' | 'right') => ({
      scale: 0.85,
      opacity: 0,
      filter: "blur(6px)",
      x: dir === 'right' ? 120 : -120
    }),
    animate: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      x: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (dir: 'left' | 'right') => ({
      scale: 0.9,
      opacity: 0,
      filter: "blur(6px)",
      x: dir === 'right' ? -120 : 120,
      transition: { duration: 0.5 }
    })
  };

  return (
    <div className="relative min-h-screen bg-obsidian text-stone-100 flex flex-col justify-between py-12 px-4 md:px-8 overflow-hidden select-none" id={`memory-chapter-${month.id}`}>
      
      {/* Absolute Atmospheric Overlays */}
      <div className="atmosphere z-0 opacity-80" />
      <div className="cinematic-vignette z-0" />

      {/* Floating Animated Symbols Thread */}
      <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden pointer-events-none z-0">
        {flowElements.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-[-50px] animate-slide-up text-lg opacity-40 select-none filter blur-[0.4px]"
            style={{
              left: `${item.left}%`,
              animationDelay: `${item.delay}s`,
              animationDuration: `${item.speed}s`,
              transform: `scale(${item.scale})`,
              fontSize: `${18 * item.scale}px`,
              // Render inline animation class style mapping
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear'
            }}
          >
            {renderFloatingSymbol(item.id)}
          </div>
        ))}
      </div>

      {/* TOP NAVIGATION HEADER */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between">
        <motion.button
          id={`back-to-timeline-btn-${month.id}`}
          onClick={onBackToTimeline}
          className="flex items-center gap-2.5 px-4 py-2 bg-neutral-950/80 backdrop-blur-md rounded-full border border-luxury-gold/30 hover:border-luxury-rose/50 text-xs text-stone-300 hover:text-stone-100 cursor-pointer transition-all duration-300 glass"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-4 h-4 text-luxury-rose" />
          <span>Return into Cosmos</span>
        </motion.button>
      </div>

      {/* CENTRAL SPLIT VIEW: TEXT STORIES & PHOTO INTERACTIVE PROJECTION */}
      <div className="relative z-10 w-full max-w-6xl mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
        
        {/* LEFT COLUMN: CHAPTER INTRO & NARRATIVE */}
        <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 text-luxury-rose mb-2 font-mono text-xs uppercase tracking-widest font-semibold">
              <Calendar className="w-3.5 h-3.5 text-luxury-gold" />
              <span>{month.subtitle.split(' — ')[0]}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extralight tracking-tight font-serif text-stone-50 leading-tight mb-4 italic">
              {month.title}
            </h1>

            <div className="w-16 h-[1px] bg-gradient-to-r from-luxury-rose via-luxury-gold to-luxury-rose rounded mb-6" />

            <p className="text-stone-300 font-light text-sm md:text-base leading-relaxed mb-6 font-sans tracking-wide">
              {month.description}
            </p>
          </motion.div>

          {/* Micro stats tracker / indicator points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="p-4 rounded-xl bg-neutral-950/40 border border-white/5 flex flex-col gap-2 mb-4 glass"
          >
            <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
              {(month.images[activeImageIndex] as any).chronicle || month.images[activeImageIndex].caption}
            </span>
            <div className="text-xs text-stone-300 font-light flex items-center gap-1.5 italic">
              <span className="w-1.5 h-1.5 rounded-full bg-luxury-rose animate-ping" />
              "The sweetest memory in this fold is picture {activeImageIndex + 1}."
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE POLAROID PORTAL CAROUSEL */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center order-1 lg:order-2">
          
          {/* POLAROID FRAMECONTAINER */}
          <div className="relative w-full max-w-md aspect-[4/5] md:aspect-[3.8/4.2] rounded-2xl p-4 md:p-5 bg-neutral-950 border border-white/5 shadow-2xl overflow-hidden flex flex-col justify-between group glass">
            
            {/* Top Light Leak Glow Accent */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-luxury-rose via-luxury-gold to-luxury-rose" />

            {/* Polaroid Photo Screen Box */}
            <div className="relative w-full aspect-square bg-neutral-950 rounded border border-neutral-900 overflow-hidden flex items-center justify-center shadow-inner">
              
              {/* Slides Container */}
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activeImageIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={month.images[activeImageIndex].url}
                    alt={month.images[activeImageIndex].caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none pointer-events-none transition-all duration-700 hover:scale-105"
                    style={{ objectPosition: (month.images[activeImageIndex] as any).objectPosition || 'center' }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Glowing soft Vignette inside polaroid */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_60%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />

              {/* Navigation Indicators Overlay (Arrow Left) */}
              <button
                id="chapter-prev-arrow"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-luxury-rose text-stone-200 hover:text-stone-50 flex items-center justify-center border border-white/10 shadow hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Navigation Indicators Overlay (Arrow Right) */}
              <button
                id="chapter-next-arrow"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-luxury-rose text-stone-200 hover:text-stone-50 flex items-center justify-center border border-white/10 shadow hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Micro-counter */}
              <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md rounded px-2.5 py-1 text-[10px] font-mono tracking-widest text-[#c5a059] border border-white/5 font-semibold">
                <span className="text-luxury-rose font-bold">{activeImageIndex + 1}</span> / {month.images.length}
              </div>
            </div>

            {/* Polaroid Bottom Text Label (Handwritten feel description) */}
            <div className="mt-4 flex-grow flex flex-col justify-center min-h-[5rem] px-1 pb-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeImageIndex}
                  className="text-stone-300 font-cursive text-lg italic tracking-wide text-center leading-relaxed font-light"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {month.images[activeImageIndex].caption}
                </motion.p>
              </AnimatePresence>
            </div>
            
            {/* Visual Film Marker Lines */}
            <div className="flex justify-between items-center text-[8px] font-mono text-[#c5a059]/75 mt-2 uppercase px-1">
              <span>Memory capture index</span>
              <span>2026_06_ANNIVERSARY</span>
            </div>
          </div>

          {/* DOTS POSITION BAR */}
          <div className="flex gap-2.5 mt-5">
            {month.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > activeImageIndex ? 'right' : 'left');
                  setActiveImageIndex(idx);
                }}
                className={`w-3.5 h-1.5 rounded-full transition-all duration-300 ${
                  activeImageIndex === idx ? 'w-7 bg-luxury-rose' : 'bg-neutral-800 hover:bg-neutral-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>

      {/* FOOTER INSTRUCTIONS */}
      <div className="relative z-10 text-center text-[10px] font-mono tracking-widest text-stone-500 uppercase">
        <span>Use arrow keys to cycle memories.</span>
      </div>
    </div>
  );
}
