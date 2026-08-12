"use client";

import React, { Suspense, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { ShirtModel } from "./ShirtModel";
import { PenLine, Hand } from "lucide-react";

interface Canvas3DProps {
  penColor: string;
  penSize: number;
  userId: string;
}

function ZoomTracker({ setCanSign }: { setCanSign: (val: boolean) => void }) {
  const isZoomedInRef = useRef(false);
  useFrame(({ camera }) => {
    // Check distance from camera to origin (where the shirt is)
    const dist = camera.position.length();
    const isZoomedIn = dist < 4.5;
    if (isZoomedIn !== isZoomedInRef.current) {
      isZoomedInRef.current = isZoomedIn;
      setCanSign(isZoomedIn);
    }
  });
  return null;
}

export function Canvas3D({ penColor, penSize, userId }: Canvas3DProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [canSign, setCanSign] = useState(false);
  const [mode, setMode] = useState<"draw" | "move">("draw");

  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        
        <ZoomTracker setCanSign={setCanSign} />
        
        <Suspense fallback={null}>
          <ShirtModel penColor={penColor} penSize={penSize} setIsDrawing={setIsDrawing} canSign={canSign} mode={mode} userId={userId} />
          <Environment preset="city" />
          <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2} far={4} />
        </Suspense>

        <OrbitControls 
          enabled={!isDrawing}
          enablePan={true} 
          enableZoom={true} 
          minDistance={1} 
          maxDistance={10} 
          makeDefault 
        />
      </Canvas>
      
      {/* Action Bar (Replaces static tooltip) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-none z-10 animate-fade-in">
        <div className="glass-panel p-2 flex flex-col gap-2 rounded-2xl shadow-2xl shadow-primary/10 border-white/40 pointer-events-auto">
          <button 
            onClick={() => setMode("draw")}
            className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all duration-300 ${mode === "draw" ? "bg-primary text-white shadow-md scale-105" : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-800"}`}
            title="Draw Mode"
          >
            <PenLine className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Draw</span>
          </button>
          
          <button 
            onClick={() => setMode("move")}
            className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all duration-300 ${mode === "move" ? "bg-primary text-white shadow-md scale-105" : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-800"}`}
            title="Move Mode"
          >
            <Hand className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Move</span>
          </button>
        </div>
        
        {/* Dynamic Context Tip */}
        <div className="glass-panel px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center shadow-lg border border-white/40 backdrop-blur-md bg-white/70">
          {mode === "draw" ? "L-Click: Draw" : "L-Click: Rotate"}
        </div>
      </div>

      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium backdrop-blur-sm px-6 py-3 rounded-full pointer-events-none transition-colors duration-300 shadow-lg ${canSign ? 'bg-green-500/90 text-white' : 'bg-rose-500/90 text-white'}`}>
        {canSign ? "✍️ Draw on the shirt!" : "🔍 Zoom in closer to sign!"}
      </div>
    </div>
  );
}
