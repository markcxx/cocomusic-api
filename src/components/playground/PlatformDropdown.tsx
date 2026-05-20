"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { MusicPlatform } from "@/lib/models/music";
import type { PlatformOption } from "@/components/playground/types";

type Props = {
  label: string;
  value: MusicPlatform;
  options: PlatformOption[];
  onChange: (value: MusicPlatform) => void;
  isDisabled?: (value: MusicPlatform) => boolean;
  helperText?: string;
};

export default function PlatformDropdown({
  label,
  value,
  options,
  onChange,
  isDisabled,
  helperText,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = options.find((item) => item.id === value);

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{label}</label>
      {helperText ? (
        <p className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300">
          {helperText}
        </p>
      ) : null}

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((state) => !state)}
          className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition-all hover:border-zinc-300 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700"
        >
          <span>{current?.label ?? value}</span>
          <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            >
              {options.map((item) => {
                const disabled = isDisabled?.(item.id) ?? false;
                return (
                  <button
                    key={item.id}
                    disabled={disabled}
                    onClick={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      disabled
                        ? "cursor-not-allowed opacity-40"
                        : value === item.id
                          ? "bg-cyan-50 font-medium text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                    }`}
                  >
                    <span>{item.label}</span>
                    {value === item.id ? <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" /> : null}
                  </button>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
