import { Link, useLocation } from 'react-router-dom';
import { Music2, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";
  
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'light' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: light)').matches)) {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-10 h-20 border-b border-zinc-200 dark:border-zinc-800/50 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center transition-colors">
            <Music2 className="w-5 h-5 text-white dark:text-zinc-950" />
          </div>
          <span className="font-semibold text-xl tracking-tight text-zinc-900 dark:text-zinc-50 transition-colors">Cocomusic API</span>
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <Link to="/" className={isActive('/')}>首页</Link>
          <Link to="/playground" className={isActive('/playground')}>调试台</Link>
          <Link to="/docs" className={isActive('/docs')}>文档</Link>
          <Link to="/dashboard" className={isActive('/dashboard')}>运行状态</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none" aria-label="切换主题" title="切换主题">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <Link to="/playground" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-sm font-bold px-5 py-2.5 rounded-full shadow-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">立即开始</Link>
      </div>
    </nav>
  );
}
