import { useState, useRef, useEffect } from 'react';
import { Search, Send, Copy, ChevronDown, Link as LinkIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const endpoints = [
  { id: 'search', label: '综合搜索', icon: <Search className="w-4 h-4" />, desc: '跨平台检索歌曲信息' },
  { id: 'url', label: '原链解析', icon: <LinkIcon className="w-4 h-4" />, desc: '获取真实音频播放地址' },
  { id: 'lyric', label: '歌词获取', icon: <FileText className="w-4 h-4" />, desc: '获取LRC格式滚动歌词' },
];

const platforms = [
  { id: 'qq', label: 'QQ' },
  { id: 'kugou', label: 'Kugou' },
  { id: 'kuwo', label: 'Kuwo' },
  { id: 'migu', label: 'Migu' },
];

const qualities = [
  { value: '128k', label: '128kbps (标准音质 Standard)' },
  { value: '320k', label: '320kbps (高音质 High)' },
  { value: 'flac', label: 'FLAC (无损音质 Lossless)' }
];

export default function Playground() {
  const [endpoint, setEndpoint] = useState('search');
  const [platform, setPlatform] = useState('qq');
  const [quality, setQuality] = useState('320k');
  const [query, setQuery] = useState('七里香');
  const [songId, setSongId] = useState('001yS0N33yPm1B');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let requestUrl = '';
  if (endpoint === 'search') {
    requestUrl = `GET https://api.cocomusic.com/v1/search?q=${encodeURIComponent(query)}&platform=${platform}`;
  } else if (endpoint === 'url') {
    requestUrl = `GET https://api.cocomusic.com/v1/song/url?id=${songId}&platform=${platform}${platform === 'migu' ? `&quality=${quality}` : ''}`;
  } else if (endpoint === 'lyric') {
    requestUrl = `GET https://api.cocomusic.com/v1/lyric?id=${songId}&platform=${platform}`;
  }

  const getMockResponse = () => {
    if (endpoint === 'search') {
      return `{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 120,
    "songs": [
      {
        "id": "001yS0N33yPm1B",
        "title": "${query}",
        "artist": "周杰伦",
        "album": "七里香",
        "duration": 299
      }
    ]
  }
}`;
    } else if (endpoint === 'url') {
      return `{
  "code": 200,
  "msg": "success",
  "data": {
    "id": "${songId}",
    "platform": "${platform}",
    "quality": "${quality}",
    "url": "https://m801.music.126.net/2026/example.mp3",
    "duration": 299,
    "size": 11534336
  }
}`;
    } else {
      return `{
  "code": 200,
  "msg": "success",
  "data": {
    "id": "${songId}",
    "platform": "${platform}",
    "lyric": "[00:00.00] 作词 : 方文山\\n[00:01.00] 作曲 : 周杰伦\\n[00:28.00] 窗外的麻雀 在电线杆上多嘴...",
    "tlyric": ""
  }
}`;
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-zinc-950 flex transition-colors overflow-hidden h-[calc(100vh-80px)]">
      {/* Sidebar for Endpoints */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hidden md:flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="搜索接口..."
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-sm text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-zinc-400" 
            />
          </div>
        </div>
        <div className="p-3 overflow-y-auto flex-1 space-y-1">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-3 pt-2">核心数据 (Core)</div>
          {endpoints.map((ep) => (
            <button
              key={ep.id}
              onClick={() => setEndpoint(ep.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                endpoint === ep.id 
                  ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${endpoint === ep.id ? 'bg-cyan-500' : 'bg-transparent'}`}></span>
              {ep.icon}
              <span>{ep.label}</span>
            </button>
          ))}
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-3 pt-4">扩展功能 (Ext)</div>
          {[
            { id: 'playlist', label: '歌单详情', icon: <FileText className="w-4 h-4" /> },
            { id: 'album', label: '专辑信息', icon: <FileText className="w-4 h-4" /> },
            { id: 'artist', label: '歌手详情', icon: <FileText className="w-4 h-4" /> },
            { id: 'comments', label: '歌曲评论', icon: <FileText className="w-4 h-4" /> },
          ].map((ep) => (
            <button
              key={ep.id}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all opacity-50 cursor-not-allowed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
              {ep.icon}
              <span>{ep.label}</span>
              <span className="ml-auto text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">TBD</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Parameters Pane */}
        <div className="w-full lg:w-5/12 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-y-auto">
          <div className="p-6 md:p-8 flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{endpoints.find(e => e.id === endpoint)?.label}</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">{endpoints.find(e => e.id === endpoint)?.desc}</p>
            </div>
            
            <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800/50"></div>

            {endpoint === 'search' ? (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">搜索关键词 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                  <input 
                    type="text" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-sm" 
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">歌曲 ID / Hash <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 flex items-center justify-center font-mono text-xs font-bold">#</div>
                  <input 
                    type="text" 
                    value={songId} 
                    onChange={(e) => setSongId(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-sm" 
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">目标平台 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`relative py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                      platform === p.id 
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md' 
                        : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {endpoint === 'url' && (
              <div className="flex flex-col gap-3 relative animate-in fade-in slide-in-from-bottom-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">目标音质 <span className="text-zinc-400 font-normal ml-1">(部分平台可选)</span></label>
                <div ref={dropdownRef} className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2.5 px-4 text-sm text-zinc-900 dark:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  >
                    <span className="truncate">{qualities.find(q => q.value === quality)?.label}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-[calc(100%+8px)] left-0 right-0 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 flex flex-col gap-1 origin-top"
                      >
                        {qualities.map((q) => (
                          <button
                            key={q.value}
                            onClick={() => { setQuality(q.value); setIsDropdownOpen(false); }}
                            className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex justify-between items-center ${
                              quality === q.value 
                                ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-medium' 
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                            }`}
                          >
                            {q.label}
                            {quality === q.value && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <div className="mt-auto pt-8">
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> 发送请求
              </button>
            </div>
          </div>
        </div>

        {/* Response Pane */}
        <div className="w-full lg:w-7/12 flex flex-col bg-zinc-50 dark:bg-[#0a0a0c] overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/30">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
              Request URL
            </div>
            <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-3 flex items-center justify-between shadow-sm">
              <code className="text-xs md:text-sm font-mono text-zinc-700 dark:text-zinc-300 truncate text-ellipsis">{requestUrl}</code>
              <button className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors shrink-0 ml-4 hover:bg-zinc-100 dark:hover:bg-zinc-900 p-1.5 rounded-md"><Copy className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 md:p-6 relative">
            <div className="absolute top-6 right-6">
              <button className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                <Copy className="w-3 h-3" /> Copy JSON
              </button>
            </div>
            <pre className="font-mono text-xs md:text-[13px] leading-loose text-zinc-700 dark:text-zinc-300" dangerouslySetInnerHTML={{ __html:  
              getMockResponse()
                .replace(/"(.*?)"(?=:)/g, '<span class="text-pink-600 dark:text-pink-400 font-medium">"$1"</span>')
                .replace(/: "(.*?)"/g, ': <span class="text-green-600 dark:text-green-400">"$1"</span>')
                .replace(/: (\d+)/g, ': <span class="text-blue-600 dark:text-blue-400">$1</span>')
            }} />
          </div>
        </div>
      </main>
    </div>
  );
}
