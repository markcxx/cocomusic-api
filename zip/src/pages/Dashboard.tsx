import { HelpCircle, Activity, Database, Zap, CheckCircle2, Copy, RefreshCw, AlertCircle, LayoutDashboard, Key, Lock, Settings } from 'lucide-react';
import { BoxIcon } from '../App';

const Sidebar = () => (
  <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hidden lg:flex flex-col flex-shrink-0 h-[calc(100vh-80px)] sticky top-20 transition-colors">
     <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 font-sans">
       <div className="flex items-center gap-3">
         <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold">S</div>
         <div>
           <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Status</div>
           <div className="text-xs text-zinc-500">v1.2</div>
         </div>
       </div>
     </div>
     <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
       <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 transition-colors">
         <LayoutDashboard className="w-4 h-4 opacity-80" /> 统计概览
       </a>
       <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
         <Activity className="w-4 h-4 opacity-80" /> 全网调用量
       </a>
       <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
         <BoxIcon className="w-4 h-4 opacity-80" /> 接口状态
       </a>
     </nav>
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-1">
         <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
         <Settings className="w-4 h-4 opacity-80" /> Settings
       </a>
       <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
         <HelpCircle className="w-4 h-4 opacity-80" /> Support
       </a>
      </div>
  </aside>
);

export default function Dashboard() {
  return (
    <div className="flex-1 flex bg-white dark:bg-zinc-950 transition-colors">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-0 relative overflow-y-auto w-full">
        <header className="h-20 lg:h-20 px-6 lg:px-10 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur z-20 transition-colors">
           <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">运行概况 · 公开监控</h1>
           <div className="flex items-center gap-4">
             <button className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"><HelpCircle className="w-5 h-5"/></button>
             <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"></div>
           </div>
        </header>
        
        <div className="p-6 lg:p-10 space-y-6 lg:space-y-8 max-w-7xl mx-auto w-full">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: '今日调用量', val: '12.4k', change: '+5.2%', icon: <Activity className="w-4 h-4" /> },
                { title: '总调用量', val: '1.2M', change: null, icon: <Database className="w-4 h-4" /> },
                { title: '平均响应时间', val: '45ms', change: null, icon: <Zap className="w-4 h-4" /> },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 tracking-wide">{stat.title}</span>
                    <span className="text-zinc-400 dark:text-zinc-600 group-hover:text-cyan-500 transition-colors">{stat.icon}</span>
                  </div>
                  <div className="flex items-end gap-3">
                     <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tighter">{stat.val}</span>
                     {stat.change && <span className="text-xs font-semibold text-green-500 dark:text-green-400 mb-1">{stat.change}</span>}
                  </div>
                </div>
              ))}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 tracking-wide">API状态</span>
                    <span className="text-zinc-400 dark:text-zinc-600 group-hover:text-cyan-500 transition-colors"><CheckCircle2 className="w-4 h-4"/></span>
                  </div>
                  <div className="flex items-center gap-3 h-9">
                     <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></span>
                     <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">所有系统正常</span>
                  </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col min-h-[360px] transition-colors">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">调用趋势</h3>
                 <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
                   <button className="px-3 py-1 bg-white dark:bg-zinc-800 rounded text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200 dark:border-transparent">24H</button>
                   <button className="px-3 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">7D</button>
                   <button className="px-3 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">30D</button>
                 </div>
               </div>
               {/* Minimalist Chart Mockup */}
               <div className="flex-1 relative w-full border-b border-l border-zinc-200 dark:border-zinc-800/50 mt-4">
                 <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                   {[1,2,3,4].map(i => <div key={i} className="w-full h-px bg-zinc-100 dark:bg-zinc-800/30"></div>)}
                 </div>
                 <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="chartG" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(6,182,212,0.15)"></stop>
                        <stop offset="100%" stopColor="rgba(6,182,212,0)"></stop>
                      </linearGradient>
                    </defs>
                    <path d="M0,80 Q10,70 20,75 T40,60 T60,40 T80,50 T100,20 L100,100 L0,100 Z" fill="url(#chartG)"></path>
                    <path d="M0,80 Q10,70 20,75 T40,60 T60,40 T80,50 T100,20" fill="none" stroke="currentColor" className="text-cyan-500 dark:text-cyan-400" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                  </svg>
               </div>
                <div className="flex justify-between mt-3 text-[10px] font-mono text-zinc-400 dark:text-zinc-600 px-2 tracking-widest">
                  <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
                </div>
             </div>

             <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col transition-colors">
               <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">接口健康状态</h3>
               <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">实时监测各个接口的可用性与延迟情况。</p>
               
               <div className="mt-auto space-y-4">
                  {[
                    { name: '/v1/search', label: '综合搜索', latency: '32ms', status: 'optimal' },
                    { name: '/v1/song/url', label: '原链解析', latency: '86ms', status: 'optimal' },
                    { name: '/v1/lyric', label: '歌词获取', latency: '45ms', status: 'optimal' },
                    { name: '/v1/playlist', label: '歌单解析', latency: '120ms', status: 'warning' },
                  ].map((api, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${api.status === 'optimal' ? 'bg-green-500 dark:bg-green-400' : 'bg-yellow-500 dark:bg-yellow-400'}`}></span>
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{api.label}</span>
                        </div>
                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-500">{api.name}</span>
                      </div>
                      <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400">{api.latency}</span>
                    </div>
                  ))}
               </div>
             </div>
           </div>

           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm transition-colors">
             <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800/50 pb-4">
               <AlertCircle className="w-5 h-5 text-zinc-400" />
               <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">系统公告</h3>
             </div>
             <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 group">
                  <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 pt-1 shrink-0">2026-05-12</div>
                  <div>
                    <h4 className="text-zinc-800 dark:text-zinc-200 font-medium group-hover:text-cyan-500 transition-colors cursor-pointer">v1.2 接口更新：新增音频流式传输能力</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">现在您可以通过 WebSocket 接口实时接收并处理音频流数据，大幅降低延迟。</p>
                  </div>
                </div>
                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 group">
                  <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 pt-1 shrink-0">2026-04-28</div>
                  <div>
                    <h4 className="text-zinc-800 dark:text-zinc-200 font-medium group-hover:text-cyan-500 transition-colors cursor-pointer">平台维护通知</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">计划于本周日凌晨 2:00-4:00 进行系统升级，期间可能会出现短暂的网络波动。</p>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </main>
    </div>
  )
}
