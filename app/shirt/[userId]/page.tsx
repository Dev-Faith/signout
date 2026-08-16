"use client";

import React, { useState, use, useEffect } from "react";
import { Header } from "@/components/Header";
import { ColorPicker } from "@/components/ColorPicker";
import { Canvas3D } from "@/components/Canvas3D";
import { Walkthrough } from "@/components/Walkthrough";
import { Loader } from "@react-three/drei";
import { useAuth } from "@/components/AuthProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function ShirtPage({ params }: { params: Promise<{ userId: string }> }) {
  const [penColor, setPenColor] = useState("#6B21A8"); // Default to Deep Purple
  const [penSize, setPenSize] = useState(5); // Default pen size
  const [isEraser, setIsEraser] = useState(false);
  const [undoTrigger, setUndoTrigger] = useState(0);
  const [authorId, setAuthorId] = useState<string>("");

  const { userId } = use(params);
  const { user } = useAuth();
  const isOwner = user?.uid === userId;
  
  const [customText, setCustomText] = useState("Class of 2026");
  const [customDesign, setCustomDesign] = useState("glory.png");
  const [ownerName, setOwnerName] = useState("");

  useEffect(() => {
    // Establish identity
    if (user?.uid) {
      setAuthorId(user.uid);
    } else {
      let localId = localStorage.getItem("guestAuthorId");
      if (!localId) {
        localId = "guest_" + Math.random().toString(36).substring(2, 11);
        localStorage.setItem("guestAuthorId", localId);
      }
      setAuthorId(localId);
    }
  }, [user]);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const docRef = doc(db, "shirts", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.text) setCustomText(data.text);
          if (data.design) setCustomDesign(data.design);
          if (data.ownerName) setOwnerName(data.ownerName);
        }
      } catch (e) {
        console.error("Error fetching shirt config", e);
      }
    }
    fetchConfig();
  }, [userId]);

  // Handle Ctrl+Z (or Cmd+Z) for Undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setUndoTrigger(prev => prev + 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="w-full h-[100dvh] overflow-hidden relative selection:bg-primary/20">
      <Walkthrough ownerName={ownerName} />
      <Header userId={userId} isOwner={isOwner} ownerName={ownerName} />
      
      <ColorPicker 
        penColor={penColor} 
        setPenColor={setPenColor} 
        penSize={penSize} 
        setPenSize={setPenSize}
        isEraser={isEraser}
        setIsEraser={setIsEraser}
        onUndo={() => setUndoTrigger(prev => prev + 1)}
      />
      
      {/* 3D Canvas Area */}
      <div className="w-full h-full">
        <Canvas3D 
          penColor={penColor} 
          penSize={penSize} 
          userId={userId} 
          customText={customText} 
          customDesign={customDesign}
          isEraser={isEraser}
          undoTrigger={undoTrigger}
          authorId={authorId}
        />
      </div>

      {/* Visitor CTA */}
      {!isOwner && (
        <div className="absolute bottom-40 md:bottom-10 w-[90%] md:w-auto left-1/2 -translate-x-1/2 z-40">
          <div className="animate-bounce hover:animate-none">
            <Link href="/" className="glass-panel px-4 py-2.5 md:px-6 md:py-3 rounded-full flex items-center justify-between md:justify-center gap-2 md:gap-3 shadow-xl border-white/50 hover:scale-105 transition-all duration-300 group whitespace-nowrap">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
              <span className="font-bold text-[10px] sm:text-xs md:text-sm tracking-wide text-slate-800 truncate">Want your own 3D Signout Shirt? Create one for free!</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-slate-800 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </div>
        </div>
      )}

      {/* Courtesy Badge */}
      <a 
        href="https://muyiwa.dev" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 text-[10px] md:text-xs font-bold text-slate-500 hover:text-primary transition-colors bg-white/60 backdrop-blur-md px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-full border border-white/40 shadow-sm z-50 flex items-center gap-1.5"
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
