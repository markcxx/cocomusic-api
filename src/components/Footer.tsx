export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/50 py-8 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
        © 2026 cocomusic-api. All rights reserved.
      </div>
      <div className="flex gap-6 text-sm text-zinc-500 dark:text-zinc-400">
        <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">GitHub</a>
        <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Contact</a>
        <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</a>
        <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</a>
      </div>
    </footer>
  );
}
