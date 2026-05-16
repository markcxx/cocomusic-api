"use client";

import { useEffect, useRef } from 'react';
import anime from 'animejs';

interface SplitTextAnimeProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function SplitTextAnime({ text, className = '', delay = 0 }: SplitTextAnimeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Trigger animation via intersection observer for better effect when scrolling
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: containerRef.current?.querySelectorAll('.letter'),
              translateY: [40, 0],
              translateZ: 0,
              opacity: [0, 1],
              easing: "easeOutExpo",
              duration: 1200,
              delay: (el, i) => delay + 30 * i
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={containerRef} className={`inline-block ${className}`}>
      {text.split('').map((char, index) => (
        <span 
          key={index} 
          className="letter inline-block" 
          style={{ opacity: 0, transform: 'translateY(40px)' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
}
