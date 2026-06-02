/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoadingScreen } from './components/LoadingScreen';
import { TimelineScreen } from './components/TimelineScreen';
import { MemoryChapter } from './components/MemoryChapter';
import { MysterySequence } from './components/MysterySequence';
import { SoundWaveVisualizer } from './components/SoundWaveVisualizer';
import { AudioPlayer } from './components/AudioPlayer';
import { monthsData } from './data';
import { ExperiencePhase } from './types';

export default function App() {
  const [phase, setPhase] = useState<ExperiencePhase>('LOADING');
  const [visitedMonths, setVisitedMonths] = useState<number[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<number | null>(null);

  const handleSelectMonth = (monthId: number) => {
    setSelectedMonthId(monthId);
    setPhase(`CHAPTER_${monthId}` as ExperiencePhase);
    
    // Register visit
    if (!visitedMonths.includes(monthId)) {
      setVisitedMonths((prev) => [...prev, monthId]);
    }
  };

  const allVisited = visitedMonths.length === 3;

  const getActiveChapterData = () => {
    return monthsData.find((m) => m.id === selectedMonthId);
  };

  return (
    <div className="relative min-h-screen bg-obsidian font-sans text-stone-100 overflow-hidden selection:bg-luxury-rose/30 selection:text-stone-150">
      
      {/* Headless background player for MP3 soundtrack streams */}
      <AudioPlayer phase={phase} />

      {/* Global SoundWave Atmosphere Player (Becomes active after passing the first gesture loader) */}
      {phase !== 'LOADING' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          id="global-audio-visualizer"
        >
          <SoundWaveVisualizer />
        </motion.div>
      )}

      {/* Main Experience Router with sliding parallax viewport crossfades */}
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: LOADING VAULT */}
        {phase === 'LOADING' && (
          <motion.div
            key="phase-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <LoadingScreen onComplete={() => setPhase('TIMELINE')} />
          </motion.div>
        )}

        {/* PHASE 2: COSMIC TIMELINE BOARD */}
        {phase === 'TIMELINE' && (
          <motion.div
            key="phase-timeline"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <TimelineScreen
              visitedMonths={visitedMonths}
              onSelectMonth={handleSelectMonth}
              onEnterMystery={() => setPhase('MYSTERY_LOADING')}
              allVisited={allVisited}
            />
          </motion.div>
        )}

        {/* PHASE 3: MONTH CHAPTER CHRONICLES */}
        {(phase === 'CHAPTER_1' || phase === 'CHAPTER_2' || phase === 'CHAPTER_3') && getActiveChapterData() && (
          <motion.div
            key={`phase-chapter-${selectedMonthId}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <MemoryChapter
              month={getActiveChapterData()!}
              onBackToTimeline={() => setPhase('TIMELINE')}
            />
          </motion.div>
        )}

        {/* PHASE 4: MYSTERY LOADING AND POEMS & FINALS */}
        {(phase === 'MYSTERY_LOADING' || phase === 'POEM' || phase === 'FINAL_REVEAL') && (
          <motion.div
            key="phase-mystery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full"
          >
            <MysterySequence onBackToTimeline={() => setPhase('TIMELINE')} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
