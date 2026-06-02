/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { audioController } from '../utils/audioEngine';
import { ExperiencePhase } from '../types';

interface AudioPlayerProps {
  phase: ExperiencePhase;
}

const TRACK_MAP: Record<string, { src: string; start: number }> = {
  'CHAPTER_1': { 
    src: '/assets/chapter1.mp3', 
    start: 51
  },
  'CHAPTER_2': { 
    src: '/assets/chapter2.mp3', 
    start: 0
  },
  'CHAPTER_3': { 
    src: '/assets/chapter3.mp3', 
    start: 45
  },
  'MYSTERY_LOADING': { 
    src: '/assets/poem_section.mp3', 
    start: 41
  },
  'POEM': { 
    src: '/assets/poem_section.mp3', 
    start: 41
  },
  'FINAL_REVEAL': { 
    src: '/assets/poem_section.mp3', 
    start: 41
  },
};

export function AudioPlayer({ phase }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = TRACK_MAP[phase];

  useEffect(() => {
    // Cleanup previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (track) {
      // Turn off synth when track is active
      audioController.setYoutubeActive(true);
      
      // Create new audio element
      const audio = new Audio(track.src);
      audio.currentTime = track.start;
      audio.loop = true;
      
      const currentMute = audioController.getMutedState();
      if (currentMute) {
        audio.muted = true;
      }
      
      audio.play().catch(err => {
        console.warn("Failed to play audio:", err);
      });
      
      audioRef.current = audio;
    } else {
      // Turn on synth when no track
      audioController.setYoutubeActive(false);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [phase, track]);

  // Sync mute state
  useEffect(() => {
    const handleMuteChange = (e: Event) => {
      const nextMute = (e as CustomEvent).detail;
      if (audioRef.current) {
        audioRef.current.muted = nextMute;
      }
    };

    window.addEventListener('app-audio-mute-changed', handleMuteChange);
    return () => {
      window.removeEventListener('app-audio-mute-changed', handleMuteChange);
    };
  }, []);

  return null; // No UI - just background audio
}
