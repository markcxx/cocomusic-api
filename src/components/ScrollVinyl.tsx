"use client";

import { useEffect, useRef, useCallback } from 'react';
import { MotionValue, useMotionValueEvent } from 'motion/react';
import anime from 'animejs';

interface ScrollVinylProps {
  progress: MotionValue<number>;
}

export default function ScrollVinyl({ progress }: ScrollVinylProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const vinylRef = useRef<HTMLDivElement>(null);
  const tonearmRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const barsAnimationRef = useRef<anime.AnimeInstance | null>(null);
  const particleAnimationRef = useRef<anime.AnimeInstance | null>(null);

  // Initialize equalizer bars and particles
  useEffect(() => {
    if (!barsRef.current || !particlesRef.current) return;

    const barsContainer = barsRef.current;
    const particlesContainer = particlesRef.current;

    // Create equalizer bars
    if (barsContainer.children.length === 0) {
      const numBars = 24;
      for (let i = 0; i < numBars; i++) {
        const bar = document.createElement('div');
        bar.classList.add('eq-bar');
        bar.style.position = 'absolute';
        bar.style.bottom = '0';
        bar.style.width = '3px';
        bar.style.borderRadius = '2px';
        bar.style.transformOrigin = 'bottom center';

        // Position bars in a circle around the vinyl
        const angle = (i / numBars) * 360;
        const radius = 155; // distance from center
        const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
        const y = Math.sin((angle - 90) * Math.PI / 180) * radius;

        bar.style.left = `calc(50% + ${x}px)`;
        bar.style.top = `calc(50% + ${y}px)`;
        bar.style.height = '4px';
        bar.style.transform = `rotate(${angle}deg)`;
        bar.style.background = `linear-gradient(to top, #06b6d4, #8b5cf6)`;
        bar.style.opacity = '0.7';
        bar.style.transition = 'none';

        barsContainer.appendChild(bar);
      }
    }

    // Create floating music note particles
    if (particlesContainer.children.length === 0) {
      const notes = ['♪', '♫', '♬', '♩', '♭', '♮'];
      for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.classList.add('music-particle');
        particle.textContent = notes[i % notes.length];
        particle.style.position = 'absolute';
        particle.style.fontSize = `${12 + Math.random() * 10}px`;
        particle.style.opacity = '0';
        particle.style.color = ['#06b6d4', '#8b5cf6', '#3b82f6', '#ec4899'][i % 4];
        particle.style.left = `${20 + Math.random() * 60}%`;
        particle.style.top = `${20 + Math.random() * 60}%`;
        particle.style.pointerEvents = 'none';
        particlesContainer.appendChild(particle);
      }
    }

    return () => {
      if (barsAnimationRef.current) barsAnimationRef.current.pause();
      if (particleAnimationRef.current) particleAnimationRef.current.pause();
    };
  }, []);

  // Start particle floating animation
  useEffect(() => {
    if (!particlesRef.current) return;

    const particles = particlesRef.current.querySelectorAll('.music-particle');

    particleAnimationRef.current = anime({
      targets: particles,
      translateY: () => anime.random(-60, -120),
      translateX: () => anime.random(-30, 30),
      opacity: [
        { value: 0.8, duration: 600, easing: 'easeOutQuad' },
        { value: 0, duration: 800, easing: 'easeInQuad' }
      ],
      scale: [
        { value: 1.2, duration: 600 },
        { value: 0.5, duration: 800 }
      ],
      rotate: () => anime.random(-45, 45),
      duration: () => anime.random(2000, 3500),
      delay: () => anime.random(0, 2000),
      easing: 'easeOutCubic',
      loop: true,
    });

    return () => {
      if (particleAnimationRef.current) particleAnimationRef.current.pause();
    };
  }, []);

  // Animate equalizer bars based on scroll
  const animateBars = useCallback((scrollVal: number) => {
    if (!barsRef.current) return;
    const bars = barsRef.current.querySelectorAll('.eq-bar');

    bars.forEach((bar, i) => {
      const el = bar as HTMLElement;
      // Each bar gets a different height based on scroll + sine wave offset
      const phase = (i / bars.length) * Math.PI * 4;
      const wave = Math.sin(scrollVal * Math.PI * 3 + phase);
      const height = 4 + Math.abs(wave) * scrollVal * 35;
      el.style.height = `${height}px`;
      el.style.opacity = `${0.3 + scrollVal * 0.7}`;
    });
  }, []);

  // Listen to scroll progress
  useMotionValueEvent(progress, "change", (latest) => {
    progressRef.current = latest;

    // Rotate vinyl based on scroll
    if (vinylRef.current) {
      vinylRef.current.style.transform = `rotate(${latest * 720}deg)`;
    }

    // Move tonearm based on scroll
    if (tonearmRef.current) {
      const armAngle = -30 + latest * 25; // from -30deg to -5deg
      tonearmRef.current.style.transform = `rotate(${armAngle}deg)`;
    }

    // Animate equalizer bars
    animateBars(latest);
  });

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[420px] aspect-square flex items-center justify-center relative"
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 blur-xl"></div>

      {/* Equalizer bars (circular) */}
      <div ref={barsRef} className="absolute inset-0 pointer-events-none z-20"></div>

      {/* Floating music note particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none z-30"></div>

      {/* Vinyl Record */}
      <div className="relative w-[280px] h-[280px]">
        {/* Vinyl disc */}
        <div
          ref={vinylRef}
          className="absolute inset-0 rounded-full shadow-2xl"
          style={{ transition: 'none' }}
        >
          {/* Vinyl grooves */}
          <div className="absolute inset-0 rounded-full bg-[#111] border-2 border-zinc-800 overflow-hidden">
            {/* Groove rings */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-zinc-800/60"
                style={{
                  inset: `${20 + i * 12}px`,
                }}
              ></div>
            ))}

            {/* Reflective highlight */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.04] via-transparent to-transparent"></div>

            {/* Color accent on vinyl */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-cyan-500/[0.03] to-purple-500/[0.03] blur-sm"></div>
            </div>
          </div>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600 flex items-center justify-center shadow-inner border border-white/10">
              <div className="w-[30px] h-[30px] rounded-full bg-zinc-900 border-2 border-zinc-700 shadow-inner"></div>
              {/* Label text */}
              <div className="absolute w-full h-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-white/60 tracking-[0.2em] absolute top-[28px]">COCO</span>
                <span className="text-[6px] text-white/40 tracking-wider absolute bottom-[28px]">MUSIC API</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tonearm */}
        <div
          ref={tonearmRef}
          className="absolute -top-4 -right-4 w-[140px] h-[8px] z-10"
          style={{
            transformOrigin: 'right center',
            transform: 'rotate(-30deg)',
          }}
        >
          {/* Arm body */}
          <div className="absolute top-0 right-0 w-[120px] h-[4px] bg-gradient-to-l from-zinc-400 to-zinc-600 rounded-full shadow-md" style={{ top: '2px' }}></div>
          {/* Arm head (needle) */}
          <div className="absolute left-0 top-0 w-[16px] h-[8px] bg-zinc-500 rounded-sm shadow-sm"></div>
          {/* Arm pivot */}
          <div className="absolute right-[-6px] top-[-4px] w-[16px] h-[16px] bg-zinc-700 rounded-full border-2 border-zinc-600 shadow-lg"></div>
        </div>
      </div>

      {/* Waveform ring (pulses with scroll) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Outer pulse ring */}
        <circle
          cx="200" cy="200" r="190"
          fill="none"
          stroke="url(#waveGrad)"
          strokeWidth="1"
          strokeDasharray="8 12"
          opacity="0.4"
        />
        <circle
          cx="200" cy="200" r="180"
          fill="none"
          stroke="url(#waveGrad)"
          strokeWidth="0.5"
          strokeDasharray="4 20"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
