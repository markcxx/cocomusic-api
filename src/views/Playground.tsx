"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Send, Copy, Check, ChevronDown, Link as LinkIcon, FileText, Loader2, CheckCircle2, XCircle, Play, Pause, Download, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const endpoints = [
  { id: 'url', label: '原链解析', icon: <LinkIcon className="w-4 h-4" />, desc: '获取真实音频播放地址', available: true },
  { id: 'search', label: '综合搜索', icon: <Search className="w-4 h-4" />, desc: '跨平台检索歌曲信息', available: false },
  { id: 'lyric', label: '歌词获取', icon: <FileText className="w-4 h-4" />, desc: '获取LRC格式滚动歌词', available: false },
];

const platforms = [
  { id: 'qq', label: 'QQ' },
  { id: 'kugou', label: 'Kugou' },
  { id: 'kuwo', label: 'Kuwo' },
  { id: 'migu', label: 'Migu' },
];

const qualities = [
  { value: 'LQ', label: 'LQ (标准音质)' },
  { value: 'PQ', label: 'PQ (较高音质)' },
  { value: 'HQ', label: 'HQ (高音质)' },
  { value: 'SQ', label: 'SQ (无损FLAC)' },
  { value: 'ZQ', label: 'ZQ (至臻音质)' },
];

type RequestStatus = 'idle' | 'loading' | 'success' | 'error';
type ResponseTab = 'card' | 'json';

interface SongData {
  name?: string;
  artist?: string;
  cover?: string;
  id?: string;
  url?: string;
}

export default function Playground() {
  const [endpoint, setEndpoint] = useState('url');
  const [platform, setPlatform] = useState('qq');
  const [quality, setQuality] = useState('SQ');
  const [songId, setSongId] = useState('001yS0N33yPm1B');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [requestTime, setRequestTime] = useState<number>(0);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [responseTab, setResponseTab] = useState<ResponseTab>('card');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRequestUrl = () => {
    if (endpoint === 'url') {
      let url = `/v1/music/song_url?platform=${platform}&id=${encodeURIComponent(songId)}`;
      if (platform === 'migu') {
        url += `&quality=${quality}`;
      }
      return url;
    }
    return '';
  };

  const getDisplayUrl = () => {
    if (endpoint === 'url') {
      let url = `GET /v1/music/song_url?platform=${platform}&id=${encodeURIComponent(songId)}`;
      if (platform === 'migu') {
        url += `&quality=${quality}`;
      }
      return url;
    }
    return '';
  };

  const handleSendRequest = async () => {
    if (endpoint !== 'url') return;
    if (!songId.trim()) return;

    setStatus('loading');
    setResponse('');
    const startTime = Date.now();

    try {
      const url = getRequestUrl();
      const res = await fetch(url);
      const data = await res.json();
      setRequestTime(Date.now() - startTime);
      setResponse(JSON.stringify(data, null, 2));
      setStatus(data.code === 200 ? 'success' : 'error');
    } catch (err: unknown) {
      setRequestTime(Date.now() - startTime);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setResponse(JSON.stringify({
        code: 500,
        message: `请求失败: ${errorMessage}`,
        service: 'frontend',
        data: null
      }, null, 2));
      setStatus('error');
    }
  };

  const handleCopyJson = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const handleCopyUrl = () => {
    const displayUrl = getDisplayUrl();
    navigator.clipboard.writeText(displayUrl.replace('GET ', ''));
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const getSongData = useCallback((): SongData | null => {
    if (!response) return null;
    try {
      const parsed = JSON.parse(response);
      if (parsed.code === 200 && parsed.data) {
        return {
          name: parsed.data.name || parsed.data.songName || '未知歌曲',
          artist: parsed.data.artist || parsed.data.singer || '未知歌手',
          cover: parsed.data.cover || parsed.data.pic || parsed.data.album?.picUrl || '',
          id: parsed.data.id || parsed.data.songId || songId,
          url: parsed.data.url || parsed.data.playUrl || '',
        };
      }
    } catch { /* ignore */ }
    return null;
  }, [response, songId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    const songData = getSongData();
    if (!songData?.url) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(songData.url);
      audioRef.current.volume = volume;
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current!.duration);
      });
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current!.currentTime);
        setProgress(audioRef.current!.currentTime / audioRef.current!.duration);
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;
    if (!isFinite(audioRef.current.duration) || audioRef.current.duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioRef.current.currentTime = percentage * audioRef.current.duration;
    setProgress(percentage);
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const handleDownload = () => {
    const songData = getSongData();
    if (!songData?.url) return;
    const a = document.createElement('a');
    a.href = songData.url;
    a.download = `${songData.name} - ${songData.artist}.mp3`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Cleanup audio on unmount or response change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
      }
    };
  }, [response]);

  const highlightJson = (json: string) => {
    return json
      .replace(/"(.*?)"(?=\s*:)/g, '<span class="text-pink-600 dark:text-pink-400 font-medium">"$1"</span>')
      .replace(/:\s*"(.*?)"/g, ': <span class="text-green-600 dark:text-green-400">"$1"</span>')
      .replace(/:\s*(\d+)/g, ': <span class="text-blue-600 dark:text-blue-400">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="text-zinc-400 italic">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="text-amber-600 dark:text-amber-400">$1</span>');
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
              onClick={() => ep.available && setEndpoint(ep.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                !ep.available
                  ? 'opacity-50 cursor-not-allowed text-zinc-600 dark:text-zinc-400'
                  : endpoint === ep.id
                    ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${endpoint === ep.id ? 'bg-cyan-500' : 'bg-transparent'}`}></span>
              {ep.icon}
              <span>{ep.label}</span>
              {!ep.available && <span className="ml-auto text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">TBD</span>}
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

            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                歌曲 ID / Hash <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                QQ/酷狗/酷我: 可传入歌曲ID或URL编码的下载链接；咪咕: 格式为 contentId_copyrightId
              </p>
              <div className="relative">
                <div className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 flex items-center justify-center font-mono text-xs font-bold">#</div>
                <input
                  type="text"
                  value={songId}
                  onChange={(e) => setSongId(e.target.value)}
                  placeholder="输入歌曲ID..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-sm"
                />
              </div>
            </div>

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

            {platform === 'migu' && (
              <div className="flex flex-col gap-3 relative animate-in fade-in slide-in-from-bottom-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">目标音质 <span className="text-zinc-400 font-normal ml-1">(咪咕平台专用)</span></label>
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
              <button
                onClick={handleSendRequest}
                disabled={status === 'loading' || !songId.trim()}
                className="w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> 请求中...</>
                ) : (
                  <><Send className="w-4 h-4" /> 发送请求</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Response Pane */}
        <div className="w-full lg:w-7/12 flex flex-col bg-zinc-50 dark:bg-[#0a0a0c] overflow-hidden">
          {/* Request URL Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/30">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              {status === 'loading' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>}
              {status === 'success' && <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>}
              {status === 'error' && <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
              {status === 'idle' && <span className="w-2 h-2 rounded-full bg-zinc-400"></span>}
              Request URL
              {requestTime > 0 && (
                <span className="ml-auto text-[10px] text-zinc-400 font-mono">{requestTime}ms</span>
              )}
            </div>
            <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-3 flex items-center justify-between shadow-sm">
              <code className="text-xs md:text-sm font-mono text-zinc-700 dark:text-zinc-300 truncate text-ellipsis">{getDisplayUrl()}</code>
              <button
                onClick={handleCopyUrl}
                className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors shrink-0 ml-4 hover:bg-zinc-100 dark:hover:bg-zinc-900 p-1.5 rounded-md cursor-pointer"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          {response && status !== 'loading' && (
            <div className="flex items-center gap-1 px-4 pt-3 pb-0">
              <button
                onClick={() => setResponseTab('card')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer ${
                  responseTab === 'card'
                    ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 border border-b-0 border-zinc-200 dark:border-zinc-800'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                卡片视图
              </button>
              <button
                onClick={() => setResponseTab('json')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer ${
                  responseTab === 'json'
                    ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 border border-b-0 border-zinc-200 dark:border-zinc-800'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                JSON 视图
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4 md:p-6 relative">
            {status === 'idle' && !response && (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-600">
                <Send className="w-10 h-10 mb-4 opacity-30" />
                <p className="text-sm">点击「发送请求」查看响应结果</p>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="text-sm">正在请求后端 API...</p>
              </div>
            )}

            {response && status !== 'loading' && responseTab === 'json' && (
              <>
                <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                  {status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                  <button
                    onClick={handleCopyJson}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedJson ? <><Check className="w-3 h-3 text-green-500" /> 已复制</> : <><Copy className="w-3 h-3" /> Copy JSON</>}
                  </button>
                </div>
                <pre
                  className="font-mono text-xs md:text-[13px] leading-loose text-zinc-700 dark:text-zinc-300"
                  dangerouslySetInnerHTML={{ __html: highlightJson(response) }}
                />
              </>
            )}

            {response && status !== 'loading' && responseTab === 'card' && (
              <div className="flex items-center justify-center h-full">
                {(() => {
                  const songData = getSongData();
                  if (!songData) {
                    return (
                      <div className="text-center text-zinc-400 dark:text-zinc-600">
                        <XCircle className="w-10 h-10 mb-4 mx-auto opacity-30" />
                        <p className="text-sm">无法解析歌曲数据</p>
                      </div>
                    );
                  }
                  return (
                    <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-row">
                      {/* Cover Art - Left Side */}
                      <div className="relative w-48 min-h-48 shrink-0 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        {songData.cover ? (
                          <img
                            src={songData.cover}
                            alt={songData.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                              <Volume2 className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Song Info - Right Side */}
                      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 truncate">{songData.name}</h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{songData.artist}</p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-mono">ID: {songData.id}</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div
                            ref={progressRef}
                            onClick={handleProgressClick}
                            className="group relative w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full cursor-pointer"
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-cyan-500 rounded-full transition-all"
                              style={{ width: `${progress * 100}%` }}
                            />
                            {/* Slider thumb */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ left: `calc(${progress * 100}% - 6px)` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            {/* Play/Pause */}
                            <button
                              onClick={handlePlayPause}
                              disabled={!songData.url}
                              className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white flex items-center justify-center transition-all shadow-lg shadow-cyan-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            {/* Download */}
                            <button
                              onClick={handleDownload}
                              disabled={!songData.url}
                              className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Volume */}
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="w-20 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer
                                [&::-webkit-slider-thumb]:appearance-none
                                [&::-webkit-slider-thumb]:w-3
                                [&::-webkit-slider-thumb]:h-3
                                [&::-webkit-slider-thumb]:rounded-full
                                [&::-webkit-slider-thumb]:bg-cyan-500
                                [&::-webkit-slider-thumb]:shadow-md
                                [&::-webkit-slider-thumb]:transition-transform
                                [&::-webkit-slider-thumb]:duration-150
                                [&::-webkit-slider-thumb]:hover:scale-125
                                [&::-moz-range-thumb]:w-3
                                [&::-moz-range-thumb]:h-3
                                [&::-moz-range-thumb]:rounded-full
                                [&::-moz-range-thumb]:bg-cyan-500
                                [&::-moz-range-thumb]:border-0
                                [&::-moz-range-thumb]:shadow-md
                                [&::-moz-range-thumb]:transition-transform
                                [&::-moz-range-thumb]:duration-150
                                [&::-moz-range-thumb]:hover:scale-125"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
