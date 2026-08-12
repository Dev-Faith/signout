"use client";

import React, { useState, use } from "react";
import { Header } from "@/components/Header";
import { ColorPicker } from "@/components/ColorPicker";
import { Canvas3D } from "@/components/Canvas3D";
import { Loader } from "@react-three/drei";
import { useAuth } from "@/components/AuthProvider";

export default function ShirtPage({ params }: { params: Promise<{ userId: string }> }) {
  const [penColor, setPenColor] = useState("#6B21A8"); // Default to Deep Purple
  const [penSize, setPenSize] = useState(5); // Default pen size
  const { userId } = use(params);
  const { user } = useAuth();
  const isOwner = user?.uid === userId;

  return (
    <main className="w-full h-screen overflow-hidden relative selection:bg-primary/20">
      <Header userId={userId} isOwner={isOwner} />
      
      <ColorPicker penColor={penColor} setPenColor={setPenColor} penSize={penSize} setPenSize={setPenSize} />
      
      {/* 3D Canvas Area */}
      <div className="w-full h-full">
        <Canvas3D penColor={penColor} penSize={penSize} userId={userId} />
      </div>
      {/* Courtesy Badge */}
      <a 
        href="https://muyiwa.dev" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 text-xs font-medium text-slate-500 hover:text-primary transition-colors bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40 shadow-sm z-50 flex items-center gap-1.5"
      >
        <span>Courtesy of Muyiwa</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
      <Loader />
    </main>
  );
}
