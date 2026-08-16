"use client";

import React from "react";
import { Check, Palette, PenLine, Eraser, Undo2 } from "lucide-react";

interface ColorPickerProps {
  penColor: string;
  setPenColor: (color: string) => void;
  penSize: number;
  setPenSize: (size: number) => void;
  isEraser: boolean;
  setIsEraser: (b: boolean) => void;
  onUndo: () => void;
}

const COLORS = [
  { name: "Deep Purple", hex: "#6B21A8" },
  { name: "Black", hex: "#000000" },
  { name: "Royal Blue", hex: "#2563EB" },
  { name: "Crimson", hex: "#DC2626" },
  { name: "Emerald", hex: "#059669" },
  { name: "Amber", hex: "#D97706" },
];

export function ColorPicker({ penColor, setPenColor, penSize, setPenSize, isEraser, setIsEraser, onUndo }: ColorPickerProps) {
  return (
    <div className="tour-color-picker absolute left-1/2 -translate-x-1/2 bottom-24 md:bottom-auto md:left-8 md:translate-x-0 md:top-1/2 md:-translate-y-1/2 w-[95%] md:w-16 max-w-[400px] glass-panel p-2 md:p-3 flex flex-row md:flex-col items-center justify-between md:justify-start gap-2 md:gap-4 z-50 shadow-2xl shadow-primary/20 border-white/60 backdrop-blur-3xl bg-white/70 md:bg-white/50 rounded-3xl md:rounded-[2rem]">
      
      {/* Tools Section */}
      <div className="flex flex-row md:flex-col items-center gap-1.5 md:gap-2">
        <button
          onClick={onUndo}
          className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 hover:scale-105 active:scale-95 shrink-0 text-slate-700"
          title="Undo your last stroke"
        >
          <Undo2 className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button
          onClick={() => setIsEraser(!isEraser)}
          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 ${
            isEraser 
              ? "bg-primary text-white ring-2 ring-offset-2 ring-primary scale-110" 
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 hover:scale-105"
          }`}
          title="Eraser"
        >
          <Eraser className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      <div className="w-[1px] h-6 md:w-8 md:h-[1px] bg-slate-300 rounded-full shrink-0" />

      {/* Colors Section */}
      <div className={`flex flex-row md:flex-col items-center gap-1.5 md:gap-2 overflow-x-auto no-scrollbar py-2 px-2 flex-1 md:flex-none transition-opacity ${isEraser ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {COLORS.map((c) => (
          <button
            key={c.hex}
            onClick={() => {
              setPenColor(c.hex);
              setIsEraser(false);
            }}
            className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 ${
              !isEraser && penColor === c.hex ? "ring-2 ring-offset-2 ring-primary scale-[1.25] md:scale-110 z-10" : "ring-1 ring-black/10 hover:scale-105"
            }`}
            style={{ backgroundColor: c.hex }}
            title={c.name}
            aria-label={`Select ${c.name} color`}
          >
            {!isEraser && penColor === c.hex && <Check className="w-3.5 h-3.5 md:w-5 md:h-5 text-white drop-shadow-md" />}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-[1px] h-6 md:w-8 md:h-[1px] bg-slate-300 rounded-full shrink-0" />

      {/* Thickness Section */}
      <div className={`flex flex-row md:flex-col items-center gap-2 md:gap-4 shrink-0 px-2 md:px-0 md:pb-2 transition-opacity ${isEraser ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-slate-100 rounded-full shadow-inner border border-slate-200/80 shrink-0">
          <div 
            className="rounded-full transition-all duration-200 shadow-sm" 
            style={{ 
              width: `${Math.max(2, penSize / 1.5)}px`, 
              height: `${Math.max(2, penSize / 1.5)}px`,
              backgroundColor: isEraser ? '#cbd5e1' : penColor
            }}
          />
        </div>
        
        <input 
          type="range" 
          min="1" 
          max="12" 
          value={penSize} 
          onChange={(e) => setPenSize(Number(e.target.value))}
          className="vertical-slider-md w-16 md:w-1.5 md:h-24 h-1.5 bg-slate-300 rounded-full appearance-none cursor-pointer accent-primary"
          title="Adjust Pen Size"
        />
      </div>
      
    </div>
  );
}
