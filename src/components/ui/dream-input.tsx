import React, { KeyboardEvent, useRef } from "react";
import { useTypewriter } from "@/hooks/useTypewriter";
import { ArrowRight } from "lucide-react";

interface DreamInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  className?: string;
}

const PHRASES = [
  "outcome defines success?",
  "is this asset built to do?",
  "result should this asset drive?",
  "would serve your business best?"
];

export function DreamInput({
  value,
  onChange,
  onSubmit,
  className = ""
}: DreamInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const typewrittenText = useTypewriter(PHRASES, 45, 25, 1200);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit();
    }
  };

  return (
    <div
      className={`shiny-input-container flex flex-row items-center w-full min-w-[300px] border border-transparent shadow-2xl backdrop-blur-md group ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      <input
        id="dream-intent-input"
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`What ${typewrittenText}`}
        className="flex-1 bg-transparent border-none text-white placeholder-white/80 font-body type-functional text-[13px] xs:text-sm sm:text-base md:text-xl py-3 pl-4 pr-1 sm:px-6 lg:py-4 lg:px-8 outline-none focus:outline-none focus:ring-0 active:outline-none w-full transition-opacity duration-200"
        autoComplete="off"
      />
      <button
        onClick={() => value.trim() && onSubmit()}
        disabled={!value.trim()}
        className="mr-1.5 sm:mr-2 lg:mr-3 p-2 sm:p-3 lg:p-4 rounded-full bg-zinc-900/50 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group-focus-within:bg-zinc-800 shrink-0"
        aria-label="Submit dream intent"
      >
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>
    </div>
  );
}
