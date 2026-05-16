"use client";

import { useEffect, useRef } from 'react';
import anime from 'animejs';

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// SVG paths for music elements
const svgElements = [
  // Music note 1
  `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M9 18V5l12-2v13M9 9l12-2M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  // Music note 2
  `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  // Vinyl
  `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>`,
  // Equalizer bar
  `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M4 22V9M8 22V5M12 22v-9M16 22v-5M20 22V2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
];

export default function AnimeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<any>(null); // to hold animation instance

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = ''; // Clear previous if any

    const numberOfElements = window.innerWidth > 768 ? 40 : 20;

    for (let i = 0; i < numberOfElements; i++) {
      const el = document.createElement('div');
      el.classList.add('anime-shape');
      // Set random size and color
      const size = random(20, 60);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.position = 'absolute';
      el.style.top = '50%';
      el.style.left = '50%';
      el.style.marginLeft = `-${size/2}px`;
      el.style.marginTop = `-${size/2}px`;
      
      const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#a1a1aa', '#71717a'];
      el.style.color = colors[random(0, colors.length - 1)];
      
      el.innerHTML = svgElements[random(0, svgElements.length - 1)];
      container.appendChild(el);
    }

    const shapes = container.querySelectorAll('.anime-shape');

    animRef.current = anime({
      targets: shapes,
      translateX: () => random(-window.innerWidth / 2, window.innerWidth / 2),
      translateY: () => random(-window.innerHeight / 2, window.innerHeight / 2),
      scale: () => random(50, 150) / 100,
      rotate: () => random(-180, 180),
      opacity: () => random(2, 10) / 100,
      duration: () => random(6000, 12000),
      delay: anime.stagger(200),
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });

    return () => {
      if (animRef.current && animRef.current.pause) animRef.current.pause();
      container.innerHTML = '';
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen dark:mix-blend-lighten"
    />
  );
}
