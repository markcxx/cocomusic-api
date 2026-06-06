"use client";

import { ChevronLeft, ChevronRight, FileText, Link as LinkIcon, Music2, Search } from "lucide-react";
import { endpointConfigs, extensionEndpoints } from "@/components/playground/constants";
import type { EndpointId } from "@/components/playground/types";

const icons = {
  url: <LinkIcon className="h-4 w-4" />,
  detail: <FileText className="h-4 w-4" />,
  lyric: <Music2 className="h-4 w-4" />,
  search: <Search className="h-4 w-4" />,
};

type Props = {
  endpoint: EndpointId;
  isOpen: boolean;
  onChange: (endpoint: EndpointId) => void;
  onToggle: () => void;
};

export default function EndpointSidebar({ endpoint, isOpen, onChange, onToggle }: Props) {
  return (
    <div className="relative hidden h-full shrink-0 overflow-visible md:block">
      <aside
        className={`relative h-full shrink-0 border-r border-zinc-200 bg-zinc-50/70 transition-[width] duration-200 md:flex md:flex-col dark:border-zinc-800 dark:bg-zinc-950/50 ${
          isOpen ? "w-64" : "w-0 border-r-0"
        }`}
      >
        <div
          className={`flex h-full min-h-0 w-64 flex-col overflow-hidden transition-opacity duration-150 ${
            isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
              Endpoint Nav
            </p>
            <h2 className="mt-1 text-lg font-bold text-zinc-950 dark:text-zinc-50">接口选择</h2>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="搜索接口..."
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto p-3">
            <div className="mb-2 px-3 pt-2 text-xs font-bold uppercase tracking-wider text-zinc-500">核心接口</div>
            {endpointConfigs.map((item) => (
              <button
                key={item.id}
                onClick={() => item.available && onChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  endpoint === item.id
                    ? "bg-cyan-50 font-medium text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${endpoint === item.id ? "bg-cyan-500" : "bg-transparent"}`} />
                {icons[item.id]}
                <span>{item.label}</span>
              </button>
            ))}

            <div className="mb-2 px-3 pt-4 text-xs font-bold uppercase tracking-wider text-zinc-500">扩展能力</div>
            {extensionEndpoints.map((item) => (
              <button
                key={item.id}
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 opacity-50 dark:text-zinc-400"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-transparent" />
                <FileText className="h-4 w-4" />
                <span>{item.label}</span>
                <span className="ml-auto rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">TBD</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <button
        type="button"
        aria-label={isOpen ? "收起接口导航" : "展开接口导航"}
        onClick={onToggle}
        style={{ left: isOpen ? "16rem" : "0" }}
        className="absolute top-1/2 z-20 inline-flex h-14 w-5 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-zinc-200 bg-white text-zinc-500 shadow-sm transition-[left,background-color,color,border-color] duration-200 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </div>
  );
}
