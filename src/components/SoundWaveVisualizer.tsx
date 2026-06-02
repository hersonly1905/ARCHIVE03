/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioController } from '../utils/audioEngine';

export function SoundWaveVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Sync React state with engine
    setIsMuted(audioController.getMutedState());
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 120;
      canvas.height = 36;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const dataArray = new Uint8Array(64);
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      const analyser = audioController.getAnalyser();
      const isYoutubePlaying = audioController.getYoutubeActive() && !isMuted;

      if (isMuted || (!analyser && !isYoutubePlaying)) {
        // Render a calm flat horizontal idle wave
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255, 61, 96, 0.2)'; // Luxury Rose line
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        for (let i = 0; i < canvas.width; i++) {
          const y = canvas.height / 2 + Math.sin(i * 0.1) * 1.5;
          ctx.lineTo(i, y);
        }
        ctx.stroke();
        return;
      }

      if (isYoutubePlaying) {
        // Generate a lush sliding romantic wave structure to mimic YouTube's ambient soundtrack
        for (let i = 0; i < dataArray.length; i++) {
          const sinBase = Math.sin(i * 0.25 + Date.now() * 0.005);
          const cosBase = Math.cos(i * 0.15 - Date.now() * 0.004);
          dataArray[i] = Math.floor(Math.abs(sinBase * 100 + cosBase * 80 + 35));
        }
      } else if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 61, 96, 0.7)'; // Luxury Rose glowing line
      
      // Draw smooth romantic wave line
      ctx.beginPath();
      const sliceWidth = canvas.width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        // Scale frequency value
        const v = dataArray[i] / 255.0;
        const amplitude = v * (canvas.height * 0.82);
        // Soft modulation with math sine wave for floating visual quality
        const sinWave = Math.sin(i * 0.15 + Date.now() * 0.006) * 3;
        const y = canvas.height / 2 + (i % 2 === 0 ? amplitude : -amplitude) * 0.5 + sinWave;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Smooth curve
          const prevX = x - sliceWidth;
          const prevV = dataArray[i - 1]/255.0;
          const prevAmplitude = prevV * (canvas.height * 0.82);
          const prevSin = Math.sin((i - 1) * 0.15 + Date.now() * 0.006) * 3;
          const prevY = canvas.height / 2 + ((i - 1) % 2 === 0 ? prevAmplitude : -prevAmplitude) * 0.5 + prevSin;
          
          ctx.quadraticCurveTo(prevX + sliceWidth / 2, prevY, x, y);
        }

        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Add a subtle glowing shadow peak
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(255, 61, 96, 0.8)';
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMuted]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = audioController.toggleMute();
    setIsMuted(muted);
    
    // Play a tiny chime if unmuted to give prompt audio feedback
    if (!muted) {
      audioController.playSparkleNote(523.25, 2.0); // C5 sharp
      audioController.playSparkleNote(783.99, 2.5); // G5 sharp
    }
  };

  return (
    <div 
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-2 bg-obsidian/40 backdrop-blur-md rounded-full border border-luxury-rose/20 hover:border-luxury-rose/50 shadow-lg cursor-pointer transition-all duration-300 glass"
      onClick={handleToggleMute}
      id="sound-indicator-container"
    >
      <div className="flex flex-col text-right">
        <span className="text-[10px] uppercase tracking-widest font-mono text-luxury-gold/80 font-semibold">
          Atmosphere Synth
        </span>
        <span className="text-xs font-medium text-stone-200 font-sans">
          {isMuted ? 'Sound Off' : 'Surround On'}
        </span>
      </div>

      <div className="w-16 h-8 relative flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full opacity-80" />
      </div>

      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-luxury-rose/10 text-luxury-rose group-hover:bg-luxury-rose/20 transition-all">
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-luxury-rose animate-pulse" />
        ) : (
          <Volume2 className="w-4 h-4 text-rose-300 animate-pulse" />
        )}
      </div>
    </div>
  );
}
