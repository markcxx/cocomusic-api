"use client";

import Link from 'next/link';
import { ArrowRight, FileText, Zap, Lock, Code2, PlayCircle, Layers, CheckCircle2, Search } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useRef } from 'react';
import AnimeBackground from '../components/AnimeBackground';
import SplitTextAnime from '../components/SplitTextAnime';
import AnimeGrid from '../components/AnimeGrid';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Hero Animations
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.15], [1, 0.9]);
  const heroY = useTransform(smoothProgress, [0, 0.15], [0, 50]);

  // Code Block Parallax
  const codeY = useTransform(smoothProgress, [0, 0.2], [0, -150]);
  const codeRotateX = useTransform(smoothProgress, [0, 0.2], [0, 20]);
  const codeScale = useTransform(smoothProgress, [0, 0.2], [1, 1.1]);

  // Steps Section
  const stepsTargetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stepsProgress } = useScroll({
    target: stepsTargetRef,
    offset: ["start start", "end end"]
  });

  // Platforms Section
  const platformsTargetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: platProgress } = useScroll({
    target: platformsTargetRef,
    offset: ["start start", "end end"]
  });

  // Endpoints Section
  const endpointsTargetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: endProgress } = useScroll({
    target: endpointsTargetRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-white dark:bg-zinc-950 transition-colors relative">
      <AnimeBackground />
      {/* Sticky Hero Section */}
      <section className="h-[120vh] relative z-10 w-full overflow-hidden">
        <motion.div 
          className="sticky top-20 h-[calc(100vh-80px)] w-full flex items-center px-6 md:px-20 overflow-hidden"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full max-w-7xl mx-auto">
            <div className="space-y-8 z-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></span>
                v1.0：全平台音频原链解析支持
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] text-zinc-900 dark:text-zinc-50"
              >
                极简音乐解析 <br />
                <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 bg-clip-text text-transparent">API 解决方案.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
                className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl leading-relaxed max-w-md"
              >
                高效、精确、可靠。通过极简的 RESTful 接口，无缝接入主流音乐平台数据。消除繁琐的适配工作，获取直链音频体验。
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link href="/playground" className="h-12 px-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold rounded-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-lg">
                  立即体验 <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/docs" className="h-12 px-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" /> 查看文档
                </Link>
              </motion.div>
            </div>

            <motion.div 
              style={{ y: codeY, rotateX: codeRotateX, scale: codeScale }}
              className="relative w-full max-w-lg mx-auto md:ml-auto perspective-1000"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-30 blur-2xl"></div>
              
              <div className="relative bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden transform-gpu">
                <div className="flex items-center gap-1.5 px-4 h-11 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="ml-4 text-[10px] text-zinc-500 font-mono tracking-wider italic uppercase">terminal</div>
                </div>
                <div className="p-6 font-mono text-[13px] leading-relaxed overflow-x-auto text-zinc-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <pre>
<span className="text-cyan-400">curl</span> -X GET \
  <span className="text-green-400">'https://api.cocomusic.com/v1/search?q=hello&platform=qq'</span>

<span className="text-zinc-500"># Response</span>
{`{
  "`}<span className="text-pink-400">status</span>{`": `}<span className="text-blue-400">200</span>{`,
  "`}<span className="text-pink-400">data</span>{`": {
    "`}<span className="text-pink-400">songs</span>{`": [
      { "`}<span className="text-pink-400">id</span>{`": "`}<span className="text-green-400">12345</span>{`", "`}<span className="text-pink-400">title</span>{`": "`}<span className="text-green-400">Hello</span>{`" }
    ]
  }
}`}
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Scroll-Linked SVG Steps Section */}
      <section ref={stepsTargetRef} className="relative w-full h-[300vh] bg-zinc-50 dark:bg-[#0a0a0c] border-t border-zinc-200 dark:border-zinc-800">
        <div className="sticky top-20 h-[calc(100vh-80px)] overflow-hidden flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-6 w-full">
          
          {/* Scroll SVG Area */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-0 opacity-80">
            <svg width="100%" height="100%" viewBox="0 0 1000 600" className="max-w-4xl mx-auto opacity-30 dark:opacity-20 blur-[1px]">
              <defs>
                <linearGradient id="glowG" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <filter id="svgBlur">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Musical Staff Drawing (Scroll synced) */}
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.path
                  key={i}
                  d={`M 100 ${260 + i * 20} C 300 ${100 + i * 20}, 500 ${500 + i * 20}, 700 ${260 + i * 20} S 900 ${100 + i * 20}, 950 ${260 + i * 20}`}
                  fill="none"
                  stroke="url(#glowG)"
                  strokeWidth={i === 0 || i === 4 ? 3 : 1}
                  strokeLinecap="round"
                  opacity={0.8 - i * 0.15}
                  filter="url(#svgBlur)"
                  style={{ pathLength: stepsProgress }}
                />
              ))}

              {/* Animated Sound Wave (Scroll synced) */}
              <motion.path
                fill="none"
                stroke="#6366f1"
                strokeWidth="4"
                strokeLinecap="round"
                style={{ pathLength: stepsProgress }}
                initial={{ d: "M 100,450 Q 200,350 300,450 T 500,450 T 700,450 T 900,450" }}
                animate={{
                  d: [
                    "M 100,450 Q 200,350 300,450 T 500,450 T 700,450 T 900,450", 
                    "M 100,450 Q 200,550 300,450 T 500,450 T 700,450 T 900,450", 
                    "M 100,450 Q 200,250 300,450 T 500,450 T 700,450 T 900,450",
                    "M 100,450 Q 200,350 300,450 T 500,450 T 700,450 T 900,450"
                  ]
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              />
            </svg>
          </div>

          {/* Follower Note Dot (Using CSS offset-path animated by Framer Motion) */}
          <motion.div 
            className="absolute z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] text-cyan-500"
            style={{ 
              offsetPath: 'path("M 100 260 C 300 100, 500 500, 700 260 S 900 100, 950 260")',
               // Map scroll progress to offset-distance
              offsetDistance: useTransform(stepsProgress, [0, 1], ["0%", "100%"])
            }}
          >
            <span className="text-sm">🎵</span>
          </motion.div>

          <div className="w-full md:w-1/2 flex flex-col justify-center h-full relative z-10 space-y-12 pr-0 md:pr-12">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4 text-shadow-sm">
                <SplitTextAnime text="三步极简接入" className="bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent" />
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">我们将复杂的全网解析逻辑封装在云端，对外只提供最纯粹的 JSON API。您的前端应用将告别繁重的加解密工作。</p>
            </div>
            
            <div className="flex flex-col gap-8 relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 -z-10"></div>
              
              <div className="flex gap-6 items-start">
                <motion.div 
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm"
                  style={{ 
                    borderColor: useTransform(stepsProgress, [0, 0.3], ["#e4e4e7", "#06b6d4"]),
                    color: useTransform(stepsProgress, [0, 0.3], ["#a1a1aa", "#06b6d4"])
                  }}
                >
                  <span className="font-mono font-bold text-lg">1</span>
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">构造请求</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">确定你要解析的歌曲 ID （或全网统一 Hash），指定目标平台。如：<code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-cyan-600 dark:text-cyan-400">platform=qq</code>。</p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <motion.div 
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm"
                  style={{ 
                    borderColor: useTransform(stepsProgress, [0.3, 0.6], ["#e4e4e7", "#3b82f6"]),
                    color: useTransform(stepsProgress, [0.3, 0.6], ["#a1a1aa", "#3b82f6"])
                  }}
                >
                  <span className="font-mono font-bold text-lg">2</span>
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">获取链接</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">调用云端解析接口，云端系统将自动突破来源检查，返回真实可播放的 MP3/FLAC <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-blue-600 dark:text-blue-400">cdn_url</code> 节点。</p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <motion.div 
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm"
                  style={{ 
                    borderColor: useTransform(stepsProgress, [0.6, 1], ["#e4e4e7", "#8b5cf6"]),
                    color: useTransform(stepsProgress, [0.6, 1], ["#a1a1aa", "#8b5cf6"])
                  }}
                >
                  <span className="font-mono font-bold text-lg">3</span>
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">流式播放</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">直接将获取到的直链绑定给 HTML5 <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-purple-600 dark:text-purple-400">{'<audio>'}</code> 标签或是您的原生 AVAudioPlayer 进行播放。</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex w-1/2 justify-center items-center h-full relative z-10">
            {/* Visualizer for steps */}
             <motion.div 
               className="w-full max-w-sm aspect-square bg-[#0a0a0c]/80 backdrop-blur-2xl border border-zinc-800/80 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden"
               style={{
                 boxShadow: useTransform(stepsProgress, [0, 0.5, 1], [
                   "0 0 40px rgba(6,182,212,0.1)",
                   "0 0 60px rgba(59,130,246,0.2)",
                   "0 0 80px rgba(139,92,246,0.3)"
                 ])
               }}
             >
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
               
               {/* Animated rings based on scroll progress */}
               <motion.div 
                 className="absolute inset-4 rounded-full border border-dashed border-cyan-500/30"
                 style={{ rotate: useTransform(stepsProgress, [0, 1], [0, 180]) }}
               ></motion.div>
               <motion.div 
                 className="absolute inset-12 rounded-full border border-blue-500/20"
                 style={{ scale: useTransform(stepsProgress, [0, 0.5, 1], [0.8, 1, 0.9]) }}
               ></motion.div>
               
               <div className="relative text-zinc-300 font-mono text-center flex flex-col items-center">
                 <motion.div
                   style={{
                     opacity: useTransform(stepsProgress, [0, 0.3], [1, 0]),
                     y: useTransform(stepsProgress, [0, 0.3], [0, -20]),
                     display: useTransform(stepsProgress, p => p > 0.4 ? 'none' : 'block')
                   }}
                 >
                   <Search className="w-10 h-10 mb-2 mx-auto text-cyan-400" />
                   <div className="text-xs">GET /api/v1/...</div>
                 </motion.div>
                 
                 <motion.div
                   className="absolute top-0"
                   style={{
                     opacity: useTransform(stepsProgress, [0.2, 0.5, 0.8], [0, 1, 0]),
                     scale: useTransform(stepsProgress, [0.3, 0.5], [0.8, 1]),
                     display: useTransform(stepsProgress, p => (p < 0.2 || p > 0.8) ? 'none' : 'block')
                   }}
                 >
                   <Layers className="w-10 h-10 mb-2 mx-auto text-blue-400" />
                   <div className="text-xs">Cloud Resolving...</div>
                 </motion.div>

                 <motion.div
                   className="absolute top-0"
                   style={{
                     opacity: useTransform(stepsProgress, [0.7, 1], [0, 1]),
                     scale: useTransform(stepsProgress, [0.7, 1], [0.8, 1]),
                     display: useTransform(stepsProgress, p => p < 0.6 ? 'none' : 'block')
                   }}
                 >
                   <PlayCircle className="w-10 h-10 mb-2 mx-auto text-purple-400" />
                   <div className="text-xs text-green-400">200 OK</div>
                 </motion.div>
               </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Scroll-Linked Platforms Section */}
      <section ref={platformsTargetRef} className="relative w-full h-[300vh] bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <div className="sticky top-20 h-[calc(100vh-80px)] overflow-hidden flex flex-col md:flex-row-reverse items-center justify-center max-w-7xl mx-auto px-6 w-full">
          
          <div className="w-full md:w-1/2 flex flex-col justify-center h-full relative z-10 space-y-10 pl-0 md:pl-12">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
                <SplitTextAnime text="全平台音频源支持" delay={200} className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent" />
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">目前已无缝接入多个主流平台音乐版权代理源，我们仍在持续增加中。</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'QQ 音乐', status: '稳定', p: [0.1, 0.3], icon: '🎵' },
                { name: '网易云音乐', status: '开发中', p: [0.2, 0.4], icon: '☁️' },
                { name: '酷狗音乐', status: '稳定', p: [0.3, 0.5], icon: '🎧' },
                { name: '酷我音乐', status: '稳定', p: [0.4, 0.6], icon: '🎯' },
                { name: '咪咕音乐', status: '稳定', p: [0.5, 0.7], icon: '📻' },
                { name: 'Bilibili', status: '计划中', p: [0.6, 0.8], icon: '📺' },
              ].map((plat, i) => (
                <motion.div 
                  key={i}
                  className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-center shadow-lg"
                  style={{
                    opacity: useTransform(platProgress, plat.p, [0, 1]),
                    y: useTransform(platProgress, plat.p, [20, 0])
                  }}
                >
                  <div className="text-3xl mb-3">{plat.icon}</div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{plat.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${plat.status === '稳定' ? 'bg-green-500' : plat.status === '开发中' ? 'bg-yellow-500' : 'bg-zinc-500'}`}></span>
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{plat.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex w-1/2 justify-center items-center h-full relative z-10">
             <AnimeGrid />
          </div>
        </div>
      </section>

      {/* Scroll-Linked Endpoints Overview Section */}
      <section ref={endpointsTargetRef} className="relative w-full h-[300vh] bg-zinc-50 dark:bg-[#0a0a0c] border-t border-zinc-200 dark:border-zinc-800">
        <div className="sticky top-20 h-[calc(100vh-80px)] overflow-hidden flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-6 w-full">
          
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-0 opacity-80">
            <svg width="100%" height="100%" viewBox="0 0 1000 600" className="max-w-4xl mx-auto opacity-30 dark:opacity-20 blur-[1px]">
              <defs>
                <linearGradient id="glowEnd" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <filter id="blurEnd">
                  <feGaussianBlur stdDeviation="6" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Equalizer Bars Drawing */}
              {[...Array(15)].map((_, i) => (
                <motion.rect
                  key={i}
                  x={200 + i * 40} y="400" width="20" height="0"
                  fill="url(#glowEnd)" filter="url(#blurEnd)" rx="10"
                  style={{
                    height: useTransform(endProgress, [i * 0.05, i * 0.05 + 0.2], [0, 100 + (Math.sin(i) * 50 + 50)]),
                    y: useTransform(endProgress, [i * 0.05, i * 0.05 + 0.2], [400, 400 - (100 + (Math.sin(i) * 50 + 50))])
                  }}
                />
              ))}
              
              <motion.path
                d="M 150 400 L 850 400"
                fill="none" stroke="url(#glowEnd)" strokeWidth="4" filter="url(#blurEnd)"
                style={{ pathLength: endProgress }}
              />
            </svg>
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center h-full relative z-10 space-y-10 pr-0 md:pr-12">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
                <SplitTextAnime text="接口概览" delay={400} className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent" />
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">目前提供的能力已覆盖核心音乐需求，未来我们将支持更多高阶特性体验。</p>
            </div>

            <div className="space-y-6">
              {[
                { endpoint: 'GET /v1/search', desc: '根据关键字全局检索曲目、歌词与专辑。', icon: <Search className="w-5 h-5 text-teal-500" />, p: [0.1, 0.4] },
                { endpoint: 'GET /v1/song/url', desc: '提取支持全终端播放的真实直链（支持无损选择）。', icon: <PlayCircle className="w-5 h-5 text-teal-500" />, p: [0.3, 0.6] },
                { endpoint: 'GET /v1/lyric', desc: '获取标准化的时间轴滚动歌词（LRC），支持多语种翻译。', icon: <FileText className="w-5 h-5 text-teal-500" />, p: [0.5, 0.8] },
                { endpoint: 'GET /v1/playlist', desc: '获取歌单所有曲目并支持翻页等核心参数处理。', icon: <Layers className="w-5 h-5 text-teal-500" />, p: [0.7, 1.0] }
              ].map((api, i) => (
                <motion.div
                  key={i}
                  className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex gap-4 items-start shadow-sm"
                  style={{
                    opacity: useTransform(endProgress, api.p, [0, 1]),
                    x: useTransform(endProgress, api.p, [-30, 0])
                  }}
                >
                  <div className="mt-1 bg-teal-50 dark:bg-teal-900/20 p-2.5 rounded-xl border border-teal-100 dark:border-teal-800">{api.icon}</div>
                  <div>
                    <h3 className="font-mono text-zinc-900 dark:text-zinc-100 font-bold tracking-tight mb-1">{api.endpoint}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{api.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex w-1/2 justify-center items-center h-full relative z-10">
             {/* Cassette Tape Representation */}
             <motion.div 
               className="w-full max-w-lg aspect-[1.6] bg-zinc-200 dark:bg-zinc-900 rounded-3xl border-4 border-zinc-300 dark:border-zinc-800 flex flex-col justify-center items-center relative shadow-2xl overflow-hidden"
               style={{ 
                 rotate: useTransform(endProgress, [0, 1], [-10, 0]),
                 scale: useTransform(endProgress, [0, 1], [0.9, 1])
               }}
             >
                <div className="absolute top-4 w-3/4 h-8 bg-zinc-300 dark:bg-zinc-800 rounded-t-xl mx-auto border-t-2 border-l-2 border-r-2 border-white/20 dark:border-zinc-700"></div>
                
                {/* Sticker */}
                <div className="w-[85%] h-[60%] bg-zinc-50 dark:bg-zinc-950 rounded-xl flex items-center justify-between px-10 relative shadow-inner border border-zinc-200 dark:border-zinc-800">
                  <div className="absolute top-4 left-6 right-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between pb-2">
                    <span className="font-mono text-xs text-zinc-500 font-bold uppercase">MIX TAPE</span>
                    <span className="font-mono text-xs text-zinc-500 font-bold uppercase">V 1.0.0</span>
                  </div>
                  
                  {/* Left Spool */}
                  <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-900 rounded-full flex items-center justify-center border-4 border-zinc-300 dark:border-zinc-800 relative z-10">
                    <div className="w-12 h-12 bg-white dark:bg-zinc-950 rounded-full flex items-center justify-center shadow-inner">
                      <motion.div 
                        className="w-4 h-4 bg-zinc-400 dark:bg-zinc-700 rounded-full flex gap-1 items-center justify-center"
                        style={{ rotate: useTransform(endProgress, [0, 1], [0, 720]) }}
                      >
                         <div className="w-1 h-3 bg-zinc-300 dark:bg-zinc-800 rounded-full"></div>
                         <div className="w-1 h-3 bg-zinc-300 dark:bg-zinc-800 rounded-full"></div>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Center Window */}
                  <div className="w-1/3 h-16 bg-zinc-200 dark:bg-zinc-900 rounded border-2 border-zinc-300 dark:border-zinc-800 flex items-center justify-center z-10 overflow-hidden relative shadow-inner">
                    <div className="absolute top-0 bottom-0 left-[20%] w-1 bg-red-400/50 z-20"></div>
                    <motion.div 
                      className="absolute inset-0 flex"
                      style={{ x: useTransform(endProgress, [0, 1], [0, -100]) }}
                    >
                      <div className="flex items-center gap-1 opacity-50 px-4">
                        {[...Array(50)].map((_, i) => (
                           <div key={i} className="w-1 bg-zinc-800 dark:bg-zinc-500 rounded-full" style={{ height: `${Math.round(20 + (Math.sin(i) * 30 + 30))}%` }}></div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Right Spool */}
                  <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-900 rounded-full flex items-center justify-center border-4 border-zinc-300 dark:border-zinc-800 relative z-10">
                     <div className="w-12 h-12 bg-white dark:bg-zinc-950 rounded-full flex items-center justify-center shadow-inner">
                      <motion.div 
                        className="w-4 h-4 bg-zinc-400 dark:bg-zinc-700 rounded-full flex gap-1 items-center justify-center"
                        style={{ rotate: useTransform(endProgress, [0, 1], [0, 720]) }}
                      >
                         <div className="w-1 h-3 bg-zinc-300 dark:bg-zinc-800 rounded-full"></div>
                         <div className="w-1 h-3 bg-zinc-300 dark:bg-zinc-800 rounded-full"></div>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-6 right-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between pt-2">
                    <span className="font-mono text-xs text-zinc-500 font-bold tracking-[0.2em]">AUDIO C-90</span>
                    <span className="font-mono text-xs text-zinc-500 font-bold uppercase transition-colors hover:text-teal-500">NR [ON]</span>
                  </div>
                </div>

                <div className="absolute bottom-0 w-3/4 h-6 bg-zinc-300 dark:bg-zinc-800 rounded-b-xl mx-auto flex justify-between px-10 items-end pb-2 border-t border-white/20 dark:border-zinc-700">
                  <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-700"></div>
                  <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-700"></div>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-32 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div className="p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
               <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-500 flex items-center justify-center mb-6">
                 <Zap className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">极致响应速度</h3>
               <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">缓存与优化机制带来毫秒级的延迟，为您的终端应用带来丝滑的播放体验，不再等待加载状态。</p>
             </div>
             
             <div className="p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
               <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mb-6">
                 <Lock className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">高可用与反爬虫</h3>
               <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">SLA 承诺 99.99% 在线率。代理层智能处理各种复杂限制，提供稳定输出。</p>
             </div>

             <div className="p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 md:col-span-2 lg:col-span-1">
               <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center mb-6">
                 <Code2 className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">标准化数据结构</h3>
               <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">提供详尽开发文档，屏蔽签名鉴权复杂性，输出统一格式 JSON 数据。</p>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
}
