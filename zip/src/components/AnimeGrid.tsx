import { useEffect, useRef } from 'react';
import anime from 'animejs';

export default function AnimeGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !shapesRef.current) return;

    const shapesContainer = shapesRef.current;
    
    // Check if shapes already exist to avoid duplicating on re-renders
    if (shapesContainer.children.length === 0) {
      const colors = ['#f4a22b', '#ef841c', '#f7bb40']; 

      // Generate shapes
      const numShapes = 16;
      for (let i = 0; i < numShapes; i++) {
        const el = document.createElement('div');
        el.classList.add('anime-shape-item');
        const type = Math.floor(Math.random() * 4);
        const size = Math.random() * 25 + 15; // 15-40px

        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.position = 'absolute';
        el.style.left = '50%';
        el.style.top = '50%';
        el.style.marginLeft = `-${size/2}px`;
        el.style.marginTop = `-${size/2}px`;
        // Use CSS mix-blend-mode to replicate 'composition: blend'
        el.style.mixBlendMode = 'screen';
        
        const color = colors[Math.floor(Math.random() * colors.length)];

        if (type === 0) {
          // Solid circle
          el.style.backgroundColor = color;
          el.style.borderRadius = '50%';
        } else if (type === 1) {
          // Hollow circle
          el.style.border = `2px solid ${color}`;
          el.style.borderRadius = '50%';
        } else if (type === 2) {
          // Solid square
          el.style.backgroundColor = color;
        } else {
          // Hollow square
          el.style.border = `2px solid ${color}`;
        }

        shapesContainer.appendChild(el);
      }
    }

    const shapes = shapesContainer.querySelectorAll('.anime-shape-item');

    let animation: anime.AnimeInstance | null = null;
    let ring1Animation: anime.AnimeInstance | null = null;
    let ring2Animation: anime.AnimeInstance | null = null;

    const playAnimations = () => {
      if (animation) animation.pause();
      
      animation = anime({
        targets: shapes,
        translateX: () => anime.random(-150, 150),
        translateY: () => anime.random(-150, 150),
        rotate: () => anime.random(-180, 180),
        scale: () => anime.random(50, 150) / 100,
        duration: () => anime.random(1000, 2000),
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true,
      });

      if (!ring1Animation) {
        ring1Animation = anime({
          targets: '.outer-ring-spin',
          rotate: [0, 360],
          duration: 20000,
          easing: 'linear',
          loop: true
        });
      } else {
        ring1Animation.play();
      }

      if (!ring2Animation) {
        ring2Animation = anime({
          targets: '.inner-ring-spin',
          rotate: [0, -360],
          duration: 25000,
          easing: 'linear',
          loop: true
        });
      } else {
        ring2Animation.play();
      }
    };

    const pauseAnimations = () => {
      if (animation) animation.pause();
      if (ring1Animation) ring1Animation.pause();
      if (ring2Animation) ring2Animation.pause();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playAnimations();
          } else {
            pauseAnimations();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      pauseAnimations();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-[400px] aspect-square flex items-center justify-center relative overflow-hidden p-6"
    >
      <div className="absolute inset-4 rounded-full bg-[#1c1c1e] border-4 border-[#2c2c2e] shadow-2xl flex items-center justify-center overflow-hidden">
        {/* Background Dot Grid */}
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(#f4a22b 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            backgroundPosition: 'center center'
          }}
        ></div>

        {/* Outer Ring 1 (Tick marks) */}
        <div className="outer-ring-spin absolute w-[94%] h-[94%] rounded-full border border-[#f4a22b]/20 pointer-events-none" style={{ borderStyle: 'dashed', borderWidth: '3px' }}></div>
        
        {/* Inner Ring (With Color Arcs) */}
        <div className="inner-ring-spin absolute w-[86%] h-[86%] rounded-full border-2 border-[#333] pointer-events-none flex items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0" style={{ overflow: 'visible' }}>
                <circle cx="50" cy="50" r="49" fill="none" stroke="#f4a22b" strokeWidth="2" strokeDasharray="30 280" strokeLinecap="round" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="49" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="20 290" strokeLinecap="round" transform="rotate(45 50 50)" />
                <circle cx="50" cy="50" r="49" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="15 295" strokeLinecap="round" transform="rotate(180 50 50)" />
            </svg>
            
            {/* Some inner concentric faint rings */}
            <div className="absolute w-[60%] h-[60%] rounded-full border border-white/[0.03] pointer-events-none"></div>
            <div className="absolute w-[30%] h-[30%] rounded-full border border-white/[0.02] pointer-events-none"></div>
        </div>

        {/* Shapes Container */}
        <div ref={shapesRef} className="absolute inset-0 z-10 pointer-events-none"></div>
      </div>
    </div>
  );
}
