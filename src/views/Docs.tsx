import { Search, Copy } from 'lucide-react';

export default function Docs() {
  return (
    <div className="flex-1 flex bg-white dark:bg-zinc-950 w-full transition-colors">
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hidden lg:flex flex-col flex-shrink-0 h-[calc(100vh-80px)] sticky top-20 transition-colors">
         <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
           <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
             <input placeholder="Search..." className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md py-1.5 pl-9 pr-3 text-sm text-zinc-900 dark:text-zinc-200 outline-none focus:border-cyan-500 transition-colors" />
           </div>
         </div>
         <nav className="flex-1 p-4 overflow-y-auto space-y-6">
           <div>
             <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Getting Started</div>
             <div className="flex flex-col gap-1">
               <a href="#" className="px-2 py-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 bg-zinc-100 dark:bg-zinc-900 rounded-md">Introduction</a>
               <a href="#" className="px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Authentication</a>
               <a href="#" className="px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Errors</a>
             </div>
           </div>
            <div>
             <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Endpoints</div>
             <div className="flex flex-col gap-1">
               <a href="#" className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
                  <span className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">GET</span> /song/url
               </a>
               <a href="#" className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
                  <span className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">GET</span> /search
               </a>
                <a href="#" className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">POST</span> /playlist/create
               </a>
             </div>
           </div>
         </nav>
      </aside>
      <main className="flex-1 flex flex-col min-h-0 relative overflow-y-auto w-full transition-colors">
        <div className="max-w-4xl w-full p-8 lg:p-12 mx-auto">
           <div className="mb-12">
             <div className="text-cyan-600 dark:text-cyan-400 text-sm font-semibold mb-2">Getting Started</div>
             <h1 className="text-4xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50 mb-4">接口概览 Overview</h1>
             <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
               欢迎使用 cocomusic-api 文档。本 API 提供高效、精准的音乐元数据和流媒体链接解析服务。我们的基础架构设计旨在为开发者提供低延迟、高可靠性的集成体验，严格遵循 RESTful 架构风格，使用标准 HTTP 状态码指示请求结果。
             </p>
           </div>

           <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 mb-12"></div>

           <div className="space-y-4 mb-8">
             <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">歌曲直链解析</h2>
             <div className="flex items-center gap-3">
               <span className="px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-mono font-bold border border-green-500/20">GET</span>
               <code className="text-sm font-mono text-zinc-800 dark:text-zinc-300">/api/v1/song/url</code>
             </div>
             <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                通过歌曲的唯一标识符获取高品质音频流的直接播放链接。支持多种码率选择以适应不同的网络环境。
             </p>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
             <div className="space-y-8 min-w-0">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm transition-colors">
                  <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Request Parameters</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm min-w-max">
                       <thead className="bg-white dark:bg-zinc-950">
                         <tr className="border-b border-zinc-200 dark:border-zinc-800/50">
                           <th className="py-2.5 px-5 font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">名称</th>
                           <th className="py-2.5 px-5 font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">类型</th>
                           <th className="py-2.5 px-5 font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">必填</th>
                           <th className="py-2.5 px-5 font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">描述</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                          <tr>
                            <td className="py-3 px-5"><code className="text-cyan-600 dark:text-cyan-400 text-xs">id</code></td>
                            <td className="py-3 px-5 text-zinc-400 dark:text-zinc-500 font-mono text-xs">string</td>
                            <td className="py-3 px-5 text-zinc-900 dark:text-zinc-100">是</td>
                            <td className="py-3 px-5 text-zinc-600 dark:text-zinc-400">歌曲的唯⼀标识符</td>
                          </tr>
                           <tr>
                            <td className="py-3 px-5"><code className="text-cyan-600 dark:text-cyan-400 text-xs">br</code></td>
                            <td className="py-3 px-5 text-zinc-400 dark:text-zinc-500 font-mono text-xs">integer</td>
                            <td className="py-3 px-5 text-zinc-500">否</td>
                            <td className="py-3 px-5 text-zinc-600 dark:text-zinc-400">目标码率，默认为 320000</td>
                          </tr>
                       </tbody>
                    </table>
                  </div>
                </div>

                 <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm transition-colors">
                  <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                     <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Response Status</h3>
                  </div>
                  <div className="p-5 space-y-4 text-sm font-mono">
                     <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800/50 pb-3">
                       <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                       <span className="text-zinc-900 dark:text-zinc-100 font-bold w-10">200</span>
                       <span className="text-zinc-500 dark:text-zinc-400 w-32">SUCCESS</span>
                       <span className="text-zinc-400 dark:text-zinc-500 font-sans ml-auto text-xs hidden sm:block">请求成功</span>
                     </div>
                      <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800/50 pb-3">
                       <div className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"></div>
                       <span className="text-zinc-900 dark:text-zinc-100 font-bold w-10">400</span>
                       <span className="text-zinc-500 dark:text-zinc-400 w-32">INVALID_PARAM</span>
                       <span className="text-zinc-400 dark:text-zinc-500 font-sans ml-auto text-xs hidden sm:block">参数错误</span>
                     </div>
                      <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"></div>
                       <span className="text-zinc-900 dark:text-zinc-100 font-bold w-10">404</span>
                       <span className="text-zinc-500 dark:text-zinc-400 w-32">NOT_FOUND</span>
                       <span className="text-zinc-400 dark:text-zinc-500 font-sans ml-auto text-xs hidden sm:block">资源不存在</span>
                     </div>
                  </div>
                </div>
             </div>

             <div className="space-y-6 min-w-0">
                <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
                  <div className="flex items-center justify-between px-4 h-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase truncate break-all">cURL Request</span>
                    <button className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 ml-2"><Copy className="w-3.5 h-3.5"/></button>
                  </div>
                  <div className="p-5 font-mono text-[12px] leading-relaxed text-zinc-700 dark:text-zinc-300 overflow-x-auto">
<pre className="min-w-fit whitespace-pre">
<span className="text-cyan-600 dark:text-cyan-400">curl</span> -X GET "https://api.cocomusic.dev/v1/song/url?id=123456&br=320000" \ 
<span className="pl-5">-H </span><span className="text-green-600 dark:text-green-400">"Authorization: Bearer YOUR_API_KEY"</span>
</pre>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
                  <div className="flex items-center justify-between px-4 h-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">JSON Response</span>
                    <button className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 ml-2"><Copy className="w-3.5 h-3.5"/></button>
                  </div>
                  <div className="p-5 font-mono text-[12px] leading-relaxed text-zinc-700 dark:text-zinc-300 overflow-x-auto">
<pre className="min-w-fit">{`{
  "`}<span className="text-pink-600 dark:text-pink-400">code</span>{`": `}<span className="text-blue-600 dark:text-blue-400">200</span>{`,
  "`}<span className="text-pink-600 dark:text-pink-400">data</span>{`": [
    {
      "`}<span className="text-pink-600 dark:text-pink-400">id</span>{`": `}<span className="text-blue-600 dark:text-blue-400">123456</span>{`,
      "`}<span className="text-pink-600 dark:text-pink-400">url</span>{`": "`}<span className="text-green-600 dark:text-green-400">https://stream.cocomusic.dev/audio/123456.mp3</span>{`",
      "`}<span className="text-pink-600 dark:text-pink-400">br</span>{`": `}<span className="text-blue-600 dark:text-blue-400">320000</span>{`,
      "`}<span className="text-pink-600 dark:text-pink-400">size</span>{`": `}<span className="text-blue-600 dark:text-blue-400">8456123</span>{`,
      "`}<span className="text-pink-600 dark:text-pink-400">type</span>{`": "`}<span className="text-green-600 dark:text-green-400">mp3</span>{`"
    }
  ],
  "`}<span className="text-pink-600 dark:text-pink-400">message</span>{`": "`}<span className="text-green-600 dark:text-green-400">success</span>{`"
}`}</pre>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </main>
    </div>
    )
}
