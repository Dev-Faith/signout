"use client";

import React from "react";
import { Check, Palette, PenLine } from "lucide-react";

interface ColorPickerProps {
  penColor: string;
  setPenColor: (color: string) => void;
  penSize: number;
  setPenSize: (size: number) => void;
}

const COLORS = [
  { name: "Deep Purple", hex: "#6B21A8" },
  { name: "Black", hex: "#000000" },
  { name: "Royal Blue", hex: "#2563EB" },
  { name: "Crimson", hex: "#DC2626" },
  { name: "Emerald", hex: "#059669" },
  { name: "Amber", hex: "#D97706" },
];

export function ColorPicker({ penColor, setPenColor, penSize, setPenSize }: ColorPickerProps) {
  return (
    <div className="absolute left-8 top-1/2 -translate-y-1/2 w-60 glass-panel p-5 flex flex-col gap-6 z-10 animate-fade-in shadow-2xl shadow-primary/10 border-white/40">
      
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
        <div className="bg-primary/10 p-1.5 rounded-lg shadow-inner">
          <Palette className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 tracking-wide">Toolkit</h3>
      </div>

      {/* Colors Section */}
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Color</span>
        <div className="grid grid-cols-3 gap-3">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => setPenColor(c.hex)}
              className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 ${
                penColor === c.hex ? "ring-2 ring-offset-2 ring-primary scale-105" : "ring-1 ring-black/5 hover:ring-black/20"
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
              aria-label={`Select ${c.name} color`}
            >
              {penColor === c.hex && <Check className="w-5 h-5 text-white drop-shadow-md" />}
            </button>
          ))}
        </div>
      </div>

      {/* Thickness Section */}
      <div className="flex flex-col gap-4 border-t border-slate-200/60 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <PenLine className="w-3.5 h-3.5" /> Thickness
          </span>
          <div className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full shadow-inner border border-slate-200/50">
            <div 
              className="rounded-full transition-all duration-200 shadow-sm" 
              style={{ 
                width: `${Math.max(4, penSize)}px`, 
                height: `${Math.max(4, penSize)}px`,
                backgroundColor: penColor
              }}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <input 
            type="range" 
            min="1" 
            max="12" 
            value={penSize} 
            onChange={(e) => setPenSize(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            title="Adjust Pen Size"
          />
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-0.5">
            <span>Fine</span>
            <span>Thick</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
