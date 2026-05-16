import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

interface TopNavProps {
  className?: string;
  isDocs?: boolean;
}

export default function TopNav({ className, isDocs }: TopNavProps) {
  const location = useLocation();
  const path = location.pathname;

  const getLinkClasses = (href: string) => {
    const isActive = href === '/' ? path === href : path.startsWith(href);
    return clsx(
      'font-title-md text-title-md transition-all',
      isActive
        ? 'text-primary dark:text-secondary-fixed-dim border-b-2 border-primary dark:border-secondary-fixed-dim pb-1 opacity-80'
        : 'text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-secondary-fixed'
    );
  };

  return (
    <header className={clsx('bg-surface dark:bg-inverse-surface border-b border-outline-variant dark:border-outline w-full z-50 fixed top-0 h-16', className)}>
      <div className="flex justify-between items-center px-margin-desktop h-16 w-full max-w-container-max mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            {isDocs ? null : (
              <span className="material-symbols-outlined text-primary dark:text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>music_note</span>
            )}
            <span className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed">cocomusic-api</span>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link to="/" className={getLinkClasses('/')}>Home</Link>
            <Link to="/playground" className={getLinkClasses('/playground')}>Playground</Link>
            <Link to="/docs" className={getLinkClasses('/docs')}>Docs</Link>
            <Link to="/dashboard" className={getLinkClasses('/dashboard')}>Dashboard</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-label-caps hover:bg-primary-container transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
