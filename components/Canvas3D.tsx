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
  customText?: string;
  customDesign?: string;
  isEraser?: boolean;
  undoTrigger?: number;
  authorId?: string;
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

export function Canvas3D({ penColor, penSize, userId, customText, customDesign, isEraser, undoTrigger, authorId }: Canvas3DProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [canSign, setCanSign] = useState(false);
  const [mode, setMode] = useState<"draw" | "move">("draw");
  const [notification, setNotification] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div 
      className="w-full h-full relative"
      onWheel={(e) => {
        if (mode !== "move") {
          showNotification("Switch to 'Move' tool to zoom/pan");
        }
      }}
      onTouchMove={(e) => {
        if (mode !== "move" && e.touches.length > 1) {
          showNotification("Switch to 'Move' tool to zoom/pan");
        }
      }}
    >
      <Canvas id="shirt-3d-canvas" shadows camera={{ position: [0, 0, 6], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
        <spotLight position={[-10, 5, 10]} angle={0.2} penumbra={1} intensity={0.5} color="#c084fc" />
        
        <ZoomTracker setCanSign={setCanSign} />
        
        <Suspense fallback={null}>
          <ShirtModel 
            penColor={penColor} 
            penSize={penSize} 
            setIsDrawing={setIsDrawing} 
            canSign={canSign} 
            mode={mode} 
            userId={userId}
            customText={customText}
            customDesign={customDesign}
            isEraser={isEraser}
            undoTrigger={undoTrigger}
            authorId={authorId}
            showNotification={showNotification}
          />
          <Environment preset="city" />
          <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2} far={4} />
        </Suspense>

        <OrbitControls 
          enabled={mode === "move"}
          enablePan={true} 
          enableZoom={true} 
          minDistance={1} 
          maxDistance={10} 
          makeDefault 
        />
      </Canvas>
      
      {/* Action Bar (Replaces static tooltip) */}
      <div className="tour-action-bar absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 md:gap-3 pointer-events-none z-20 animate-fade-in">
        <div className="glass-panel p-1 md:p-2 flex flex-col gap-1 md:gap-2 rounded-xl md:rounded-2xl shadow-2xl shadow-primary/10 border-white/40 pointer-events-auto">
          <button 
            onClick={() => setMode("draw")}
            className={`p-2 md:p-3 rounded-lg md:rounded-xl flex flex-col items-center gap-1 md:gap-1.5 transition-all duration-300 ${mode === "draw" ? "bg-primary text-white shadow-md scale-105" : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-800"}`}
            title="Draw Mode"
          >
            <PenLine className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:block text-[9px] font-bold uppercase tracking-wider">Draw</span>
          </button>
          
          <button 
            onClick={() => setMode("move")}
            className={`p-2 md:p-3 rounded-lg md:rounded-xl flex flex-col items-center gap-1 md:gap-1.5 transition-all duration-300 ${mode === "move" ? "bg-primary text-white shadow-md scale-105" : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-800"}`}
            title="Move Mode"
          >
            <Hand className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:block text-[9px] font-bold uppercase tracking-wider">Move</span>
          </button>
        </div>
        
        {/* Dynamic Context Tip */}
        <div className="hidden md:block glass-panel px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center shadow-lg border border-white/40 backdrop-blur-md bg-white/70">
          {mode === "draw" ? "L-Click: Draw" : "L-Click: Rotate"}
        </div>
      </div>

      <div className={`absolute top-24 md:top-auto md:bottom-8 left-1/2 -translate-x-1/2 text-xs md:text-sm font-bold md:font-medium backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-full pointer-events-none transition-colors duration-300 shadow-lg z-20 whitespace-nowrap ${canSign ? 'bg-green-500/90 text-white' : 'bg-rose-500/90 text-white'}`}>
        <span className="hidden md:inline">{canSign ? "✍️ Draw on the shirt!" : "🔍 Zoom in closer to sign!"}</span>
        <span className="inline md:hidden">{canSign ? "✍️ Draw on shirt!" : "🔍 Pinch to zoom in closer and sign"}</span>
      </div>
      
      {/* Dynamic Action Notification */}
      <div className={`absolute top-36 md:top-24 left-1/2 -translate-x-1/2 text-sm md:text-base font-bold bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 pointer-events-none transition-all duration-300 ${notification ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}>
        {notification}
      </div>
    </div>
  );
}
