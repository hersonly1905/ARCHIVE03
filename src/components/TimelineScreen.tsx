/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, Star, Heart, Lock, CheckCircle2 } from 'lucide-react';
import { monthsData } from '../data';
import { audioController } from '../utils/audioEngine';

interface TimelineScreenProps {
  visitedMonths: number[];
  onSelectMonth: (monthId: number) => void;
  onEnterMystery: () => void;
  allVisited: boolean;
}

export function TimelineScreen({ visitedMonths, onSelectMonth, onEnterMystery, allVisited }: TimelineScreenProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [warpId, setWarpId] = useState<number | null>(null);

  const handlePortalClick = (monthId: number) => {
    // 1. Play high chime sound representing speed warp
    setIsWarping(true);
    setWarpId(monthId);
    audioController.playSparkleNote(523.25, 1.0);
    audioController.playSparkleNote(783.99, 1.5);
    audioController.playSparkleNote(1046.50, 2.0);

    // 2. Delay the screen change to let the cinematic warp transition play
    setTimeout(() => {
      onSelectMonth(monthId);
      setIsWarping(false);
      setWarpId(null);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-obsidian text-stone-100 flex flex-col justify-between py-12 px-6 overflow-hidden select-none" id="timeline-screen">
      {/* Absolute Atmospheric Overlays */}
      <div className="atmosphere z-0" />
      <div className="cinematic-vignette z-0" />

      {/* Warm Sophisticated Dark Light-Leaks */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-luxury-rose/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Floating Stars */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 4 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* HEADER SECTION - Beautiful Sophisticated Typography */}
      <div className="relative z-10 text-center max-w-xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-luxury-rose/10 border border-luxury-rose/25 rounded-full mb-4"
        >
          <Compass className="w-4 h-4 text-luxury-rose rotate-12" />
          <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase font-semibold">
            Memory Vault // Milestones
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="text-4xl md:text-5xl font-extralight tracking-tight font-serif text-stone-200 italic mt-1"
        >
          Moons of Shared Light
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="text-xs font-light text-stone-400 mt-4 tracking-wider leading-relaxed"
        >
          "Three months are short in cosmic scale, but long enough for souls to bridge universes. Travel through each milestone portal to unlock our secret core."
        </motion.p>
      </div>

      {/* THE MILESTONE PORTALS GRID */}
      <div className="relative z-10 max-w-5xl mx-auto w-full my-auto py-8">
        
        {/* Connecting timeline vector beam with gold gradient */}
        <div className="absolute top-1/2 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent -translate-y-1/2 hidden md:block z-0" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {monthsData.map((month) => {
            const isVisited = visitedMonths.includes(month.id);
            const isHovered = hoveredId === month.id;
            
            // Premium custom styling map
            const portalStyleMap = {
              1: 'hover:border-luxury-rose/50 hover:shadow-luxury-rose/10 border-neutral-900',
              2: 'hover:border-luxury-gold/50 hover:shadow-luxury-gold/10 border-neutral-900',
              3: 'hover:border-luxury-rose/40 hover:shadow-luxury-rose/10 border-neutral-900'
            }[month.id] || '';

            const badgeColorMap = {
              1: 'bg-luxury-rose/10 text-luxury-rose border-luxury-rose/30',
              2: 'bg-luxury-gold/10 text-luxury-gold border-luxury-gold/30',
              3: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
            }[month.id] || '';

            return (
              <motion.div
                key={month.id}
                id={`milestone-portal-${month.id}`}
                className={`relative rounded-2xl bg-neutral-950 border p-6 flex flex-col justify-between h-[340px] shadow-2xl glass cursor-pointer transition-all duration-500 ${portalStyleMap} ${isVisited ? 'border-luxury-gold/20' : 'border-neutral-900'}`}
                onMouseEnter={() => setHoveredId(month.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handlePortalClick(month.id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: month.id * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Micro particle sparkles orbiting individual card */}
                {isHovered && (
                  <div className="absolute inset-x-0 -top-2 flex justify-center gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-mono bg-neutral-950 border border-luxury-gold/20 py-1 px-2.5 rounded-full flex items-center gap-1 shadow-md animate-bounce">
                      <Star className="w-3 h-3 text-luxury-gold animate-spin-slow" />
                      Dive in
                    </span>
                  </div>
                )}

                {/* Portal visual window */}
                <div className="relative h-32 w-full rounded-lg overflow-hidden bg-neutral-950 mb-4 flex items-center justify-center border border-white/5">
                  {month.images.length > 0 && month.images[0] ? (
                    <div className={`absolute inset-0 bg-cover bg-center opacity-40 filter ${isHovered ? 'scale-110 blur-[1px]' : 'scale-100 blur-sm'} transition-transform duration-1000`} style={{ backgroundImage: `url(${month.images[0].url})` }} />
                  ) : null}
                  
                  {/* Glowing Portal Orbit Ring */}
                  <div className={`absolute w-16 h-16 rounded-full border border-dashed flex items-center justify-center pointer-events-none transition-all duration-700 ${isHovered ? 'scale-125 border-luxury-rose/50 border-solid rotate-90' : 'border-white/10'}`}>
                    <div className="w-10 h-10 rounded-full bg-neutral-950 flex items-center justify-center">
                      <Heart className={`w-4 h-4 text-stone-400 transition-colors duration-500 ${isHovered ? 'text-luxury-rose fill-luxury-rose/25' : ''}`} />
                    </div>
                  </div>

                  {/* Top Visit Indicator using luxury gold border badge */}
                  {isVisited && (
                    <div className="absolute top-3 right-3 bg-[#050304]/80 backdrop-blur-md rounded-full px-2 py-0.5 border border-luxury-gold/50 text-[9px] font-mono tracking-widest text-luxury-gold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-luxury-gold" />
                      Seen
                    </div>
                  )}
                </div>

                <div>
                  <span className={`inline-block text-[9px] uppercase font-mono tracking-widest border px-2 py-0.5 rounded-full mb-2 ${badgeColorMap}`}>
                    Portal {month.id}
                  </span>
                  
                  <h3 className="text-xl font-normal tracking-tight font-serif text-white mb-2">
                    {month.title}
                  </h3>
                  
                  <p className="text-xs text-stone-300 line-clamp-3 font-light leading-relaxed">
                    {month.description}
                  </p>
                </div>

                {/* Subtitle / Bottom date */}
                <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono tracking-widest text-stone-500 uppercase">
                  <span>Progress phase</span>
                  <span className="text-luxury-rose/80 font-semibold">{month.subtitle.split(' — ')[0]}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* MYSTERY PORTAL & COMPULSORY REQUIREMENT BLOCK */}
      <div className="relative z-10 max-w-sm mx-auto text-center mt-6">
        <AnimatePresence mode="wait">
          {!allVisited ? (
            <motion.div
              id="mystery-portal-locked"
              key="locked"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-6 py-4 rounded-xl bg-neutral-950/40 border border-white/5 flex flex-col items-center gap-2 glass"
            >
              <div className="flex items-center gap-1.5 text-[#c5a059]">
                <Lock className="w-4 h-4 text-luxury-gold" />
                <span className="text-xs uppercase font-mono tracking-widest font-semibold text-stone-300">
                  Mystery Vault Locked
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-sans leading-relaxed">
                Visit Chapters <span className="text-luxury-rose font-semibold">I</span>, <span className="font-semibold text-[#c5a059]">II</span>, and <span className="font-semibold text-indigo-400">III</span> to ignite the central core and reveal the secret anniversary portal.
              </p>
              
              {/* Little indicators of which months are done */}
              <div className="flex gap-2.5 mt-2">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[10px] font-bold ${
                      visitedMonths.includes(num)
                        ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold shadow-[0_0_10px_rgba(197,160,89,0.3)]'
                        : 'border-white/10 bg-black/40 text-stone-600'
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.button
              id="mystery-portal-unlocked-trigger"
              key="unlocked"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onEnterMystery}
              className="px-12 py-4 bg-black/40 backdrop-blur text-stone-200 rounded-full font-mono tracking-[0.3em] text-[12px] shadow-2xl hover:bg-rose-950/20 glow-pulse border border-[#c5a059]/30 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 text-[#c5a059] animate-pulse" />
              <span>Unlock Mystery Core</span>
              <Sparkles className="w-4 h-4 text-luxury-rose animate-pulse" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* REVOLUTIONARY TIME WARP OVERLAY - TRIGGERS ON PORTAL CLICK */}
      <AnimatePresence>
        {isWarping && (
          <motion.div
            id="timeline-warp-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#050304] overflow-hidden pointer-events-auto"
          >
            {/* The zoom space tunnel */}
            <motion.div
              initial={{ scale: 0.5, rotate: 0, filter: "blur(20px)" }}
              animate={{ 
                scale: 12, 
                rotate: 240, 
                filter: "blur(0px)",
                boxShadow: "inset 0 0 100px rgba(255,61,96,0.3)"
              }}
              transition={{ duration: 1.4, ease: "easeIn" }}
              className={`absolute w-[400px] h-[400px] rounded-full border-[8px] flex items-center justify-center opacity-80 ${
                warpId === 1 ? 'border-luxury-rose/60' :
                warpId === 2 ? 'border-luxury-gold/60' :
                'border-indigo-500/60'
              }`}
            >
              <div className="w-[300px] h-[300px] rounded-full border-[4px] border-dashed border-white/20" />
              <div className="w-[200px] h-[200px] rounded-full border border-white/10" />
            </motion.div>

            {/* Glowing radial focal burst */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.9, 1], scale: [0.8, 1.5, 3] }}
              transition={{ duration: 1.4, ease: "easeIn" }}
              className="absolute w-80 h-80 rounded-full bg-white filter blur-3xl pointer-events-none mix-blend-screen"
            />

            {/* Time Warp feedback coordinates */}
            <div className="absolute flex flex-col items-center justify-center gap-2 z-20 text-center">
              <span className="text-xs font-mono tracking-[0.5em] text-stone-400 uppercase animate-pulse">
                Temporal warp initialized
              </span>
              <span className="text-xl font-normal font-sans tracking-widest text-[#c5a059] uppercase filter drop-shadow font-serif italic">
                Entering Month {warpId}...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
