/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { audioController } from '../utils/audioEngine';
import { ExperiencePhase } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Disc, Music, VolumeX, Volume2, Radio } from 'lucide-react';

interface YouTubePlayerProps {
  phase: ExperiencePhase;
}

// Map phase/chapters of the romantic journey to exact YouTube tracks and details
const TRACK_MAP: Record<string, { id: string; start: number; title: string; trackLabel: string }> = {
  'CHAPTER_1': { 
    id: 'zRaoAWEY9Jo', 
    start: 51, 
    title: 'Chapter I: First Resonances',
    trackLabel: 'Warm Piano Atmosphere'
  },
  'CHAPTER_2': { 
    id: 'pkzOBl1p7y4', 
    start: 0, 
    title: 'Chapter II: Shared Whispers',
    trackLabel: 'Cello & Ambient Glow'
  },
  'CHAPTER_3': { 
    id: 'pIBoAh4OXhQ', 
    start: 45, 
    title: 'Chapter III: Cosmic Starscape',
    trackLabel: 'Melancholy Strings Echo'
  },
  'MYSTERY_LOADING': { 
    id: 'qoq8B8ThgEM', 
    start: 41, 
    title: 'Chapter IV: Secret Portal',
    trackLabel: 'The Climax Symphony'
  },
  'POEM': { 
    id: 'qoq8B8ThgEM', 
    start: 41, 
    title: 'Chapter IV: Secret Portal',
    trackLabel: 'The Climax Symphony'
  },
  'FINAL_REVEAL': { 
    id: 'qoq8B8ThgEM', 
    start: 41, 
    title: 'Chapter IV: Eternal Core',
    trackLabel: 'The Climax Symphony'
  },
};

export function YouTubePlayer({ phase }: YouTubePlayerProps) {
  const [playerReady, setPlayerReady] = useState(false);
  const [isMuted, setIsMuted] = useState(audioController.getMutedState());
  const [originUrl, setOriginUrl] = useState('');
  const playerRef = useRef<any>(null);
  const track = TRACK_MAP[phase];

  // Capture location origin on mount for YouTube safety origin headers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }
  }, []);

  // Initialize YT Player once the IFrame API script is available
  useEffect(() => {
    // Inject YouTube IFrame API script if not already present
    if (typeof window !== 'undefined' && !(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      try {
        if (playerRef.current) return;
        console.log('Initializing YouTube Player...');
        playerRef.current = new (window as any).YT.Player('youtube-player-element', {
          events: {
            onReady: (event: any) => {
              console.log('YouTube Player ready');
              setPlayerReady(true);
            },
            onStateChange: (event: any) => {
              console.log('YouTube Player state changed:', event.data);
              // Automatically loop video on end to ensure unbroken background scores
              if (event.data === (window as any).YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
            },
            onError: (event: any) => {
              console.error('YouTube Player error:', event.data);
            }
          }
        });
      } catch (err) {
        console.warn("Could not bind YouTube Player on target:", err);
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }
  }, []);

  // Sync YouTube Soundtrack playback when phase changes
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    const player = playerRef.current;
    const currentMute = audioController.getMutedState();

    if (track) {
      console.log('Loading YouTube track:', track.id, 'at', track.start);
      // YouTube track should be active: disable synthetic ambient oscillators
      audioController.setYoutubeActive(true);
      
      try {
        // Force the player to load and play the video
        player.loadVideoById(track.id, track.start);
        
        // Ensure video plays after loading
        setTimeout(() => {
          if (playerRef.current) {
            console.log('Calling playVideo() for track:', track.id);
            playerRef.current.playVideo();
          }
        }, 300);
        
        if (currentMute) {
          player.mute();
        } else {
          player.unMute();
          player.setVolume(100);
        }
      } catch (err) {
        console.warn("Failed transition of YouTube video track:", err);
      }
    } else {
      console.log('No track, stopping YouTube and enabling synth');
      // Exit chapters/poem back to normal ambient synths
      audioController.setYoutubeActive(false);
      try {
        player.stopVideo();
      } catch (e) {}
    }
  }, [phase, playerReady, track]);

  // Sync mute triggers from top right sound controller
  useEffect(() => {
    const handleMuteChange = (e: Event) => {
      const nextMute = (e as CustomEvent).detail;
      setIsMuted(nextMute);

      if (playerRef.current && playerReady) {
        try {
          if (nextMute) {
            playerRef.current.mute();
          } else {
            playerRef.current.unMute();
            playerRef.current.setVolume(100);
            if (track) {
              playerRef.current.playVideo();
            }
          }
        } catch (err) {
          console.warn("Error applying volume action to YouTube player:", err);
        }
      }
    };

    window.addEventListener('app-audio-mute-changed', handleMuteChange);
    return () => {
      window.removeEventListener('app-audio-mute-changed', handleMuteChange);
    };
  }, [playerReady, track]);

  return (
    <>
      {/* 
        SOPHSTICATED DECK PANEL:
        This panel houses the actual physical YouTube <iframe> with positive visual dimensions (e.g. 160x100), 
        providing flawless bypass of browser background throttling.
        We place a beautiful, theme-coordinated overlay directly on top to fully block the YouTube video player frames 
        and controls, ensuring "only music no words or video" is served.
      */}
      <AnimatePresence>
        {track && (
          <motion.div
            id="cosmic-audio-deck"
            className="fixed bottom-6 left-6 z-50 p-3 rounded-2xl glass border border-luxury-gold/30 flex items-center gap-3 bg-neutral-950/90 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Visual Record Cover / Spinning Mask Plate (Hides YouTube Video Stream fully) */}
            <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-black/90 border border-white/5 flex items-center justify-center flex-shrink-0">
              
              {/* Outer hidden holder of the active YouTube Iframe - has explicit size and allow attributes */}
              <div className="absolute inset-0 select-none pointer-events-none opacity-[0.01]">
                <iframe
                  id="youtube-player-element"
                  width="96"
                  height="64"
                  src={`https://www.youtube.com/embed/?enablejsapi=1&origin=${originUrl || 'https://localhost:3000'}&autoplay=0&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&mute=${isMuted ? 1 : 0}`}
                  allow="autoplay; encrypted-media"
                  title="Cosmic Symphony Engine"
                  style={{ pointerEvents: 'none' }}
                />
              </div>

              {/* Theme cover plate inside the mask frame */}
              <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-1 z-10 select-none">
                <motion.div
                  animate={isMuted ? {} : { rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="w-7 h-7 rounded-full bg-neutral-900 border border-luxury-gold/50 flex items-center justify-center"
                >
                  <Disc className="w-4 h-4 text-luxury-gold" />
                </motion.div>
                <span className="text-[7.5px] uppercase tracking-[0.2em] font-mono text-stone-500 font-bold">
                  {isMuted ? 'Muted' : 'Stereo'}
                </span>
              </div>
            </div>

            {/* Song description labels */}
            <div className="flex flex-col pr-4">
              <span className="text-[9px] uppercase tracking-[0.25em] font-mono text-[#c5a059] font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 text-luxury-rose animate-pulse" />
                Cosmic Stream
              </span>
              <span className="text-xs font-serif italic text-stone-200 mt-0.5 line-clamp-1 max-w-[160px]">
                {track.title}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 line-clamp-1 max-w-[160px] leading-none mt-1">
                {track.trackLabel}
              </span>
            </div>

            {/* Quick action button inside the desk */}
            <button 
              onClick={() => audioController.toggleMute()}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-neutral-900 text-stone-300 hover:text-white transition-all cursor-pointer flex-shrink-0"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-luxury-rose animate-pulse" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-luxury-gold" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
