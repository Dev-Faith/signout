"use client";

import React, { useState, use, useEffect } from "react";
import { Header } from "@/components/Header";
import { ColorPicker } from "@/components/ColorPicker";
import { Canvas3D } from "@/components/Canvas3D";
import { Loader } from "@react-three/drei";
import { useAuth } from "@/components/AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function ShirtPage({ params }: { params: Promise<{ userId: string }> }) {
  const [penColor, setPenColor] = useState("#6B21A8"); // Default to Deep Purple
  const [penSize, setPenSize] = useState(5); // Default pen size
  const { userId } = use(params);
  const { user } = useAuth();
  const isOwner = user?.uid === userId;
  
  const [customText, setCustomText] = useState("Ògo nifún Krístì");
  const [customDesign, setCustomDesign] = useState("glory.png");

  useEffect(() => {
    async function fetchConfig() {
      try {
        const docRef = doc(db, "shirts", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.text) setCustomText(data.text);
          if (data.design) setCustomDesign(data.design);
        }
      } catch (e) {
        console.error("Error fetching shirt config", e);
      }
    }
    fetchConfig();
  }, [userId]);

  return (
    <main className="w-full h-screen overflow-hidden relative selection:bg-primary/20">
      <Header userId={userId} isOwner={isOwner} />
      
      <ColorPicker penColor={penColor} setPenColor={setPenColor} penSize={penSize} setPenSize={setPenSize} />
      
      {/* 3D Canvas Area */}
      <div className="w-full h-full">
        <Canvas3D penColor={penColor} penSize={penSize} userId={userId} customText={customText} customDesign={customDesign} />
      </div>

      {/* Visitor CTA */}
      {!isOwner && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 animate-bounce hover:animate-none">
          <Link href="/" className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 shadow-xl border-white/50 hover:scale-105 transition-all duration-300 group bg-primary/90 text-white backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="font-bold text-sm tracking-wide text-black">Want your own 3D Signout Shirt? Create one for free!</span>
            <div className="bg-white/40 rounded-full p-1 group-hover:bg-white/60 transition-colors text-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </Link>
        </div>
      )}

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
