"use client";

import React, { useState } from "react";
import { PenTool, Share2, Trash2, Camera } from "lucide-react";
import { collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function Header({ userId, isOwner, ownerName }: { userId: string, isOwner: boolean, ownerName?: string }) {
  const [copied, setCopied] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await document.fonts.ready; // Ensure fonts are loaded before drawing
      const container = document.getElementById('shirt-3d-canvas');
      const glCanvas = container?.querySelector('canvas') as HTMLCanvasElement;
      if (!glCanvas) throw new Error("3D Canvas not found");

      // Create a massive offscreen canvas for high-quality social export
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 1080;
      exportCanvas.height = 1080;
      const ctx = exportCanvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2d context");

      // 1. Pristine Minimalist Background
      ctx.fillStyle = "#F8FAFC"; // Slate 50
      ctx.fillRect(0, 0, 1080, 1080);

      // 1.1 Subtle Tech Grid Pattern
      ctx.strokeStyle = "rgba(148, 163, 184, 0.08)"; // Faint slate lines
      ctx.lineWidth = 1;
      for (let i = 0; i <= 1080; i += 60) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1080); ctx.stroke(); // Vertical
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke(); // Horizontal
      }

      // 1.2 Glowing Center Backlight for the 3D model
      const orb = ctx.createRadialGradient(540, 540, 0, 540, 540, 600);
      orb.addColorStop(0, "rgba(216, 180, 254, 0.5)"); // Rich purple glow
      orb.addColorStop(1, "rgba(248, 250, 252, 0)"); // Fade to bg
      ctx.fillStyle = orb;
      ctx.fillRect(0, 0, 1080, 1080);

      // 2. Draw the 3D Shirt (Aggressively scaled & perfectly centered)
      const isPortrait = glCanvas.height > glCanvas.width;
      const scaleRatio = isPortrait 
        ? (1080 / glCanvas.width) * 1.8 // Heavily scale up mobile tall canvas
        : (1080 / glCanvas.height) * 1.3; // Scale up desktop wide canvas

      const drawW = glCanvas.width * scaleRatio;
      const drawH = glCanvas.height * scaleRatio;

      ctx.drawImage(
        glCanvas, 
        (1080 - drawW) / 2, 
        (1080 - drawH) / 2, 
        drawW, 
        drawH
      );

      // 3. Ultra-Premium Typography & Glass Elements
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Top Tagline
      ctx.font = "700 20px 'Inter', sans-serif";
      ctx.fillStyle = "#94A3B8"; // Slate 400
      try { (ctx as any).letterSpacing = "10px"; } catch(e) {} // Fallback for older browsers
      ctx.fillText("DIGITAL SIGNOUT EXPERIENCE", 540, 80);

      // Bottom Glass Panel
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(80, 860, 920, 150, 40);
      } else {
        ctx.rect(80, 860, 920, 150); // Fallback
      }
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 1)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Panel Typography
      try { (ctx as any).letterSpacing = "0px"; } catch(e) {}
      ctx.font = "900 48px 'Inter', sans-serif";
      ctx.fillStyle = "#0F172A"; // Slate 900
      ctx.fillText(`${ownerName ? ownerName.toUpperCase() + "'S" : "MY"} SIGNOUT SHIRT`, 540, 915);

      try { (ctx as any).letterSpacing = "6px"; } catch(e) {}
      ctx.font = "700 22px 'Inter', sans-serif";
      ctx.fillStyle = "#6B21A8"; // Primary Purple
      ctx.fillText("CLASS OF 2026", 540, 970);

      // 4. Trigger Download
      const dataURL = exportCanvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `Muyiwa_Signout_${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    } catch (e) {
      console.error(e);
      alert("Failed to capture snapshot! Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClear = async () => {
    if (!isOwner || !window.confirm("Are you sure you want to permanently delete all signatures from your shirt?")) return;
    setIsClearing(true);
    try {
      const strokesRef = collection(db, "shirts", userId, "strokes");
      const snapshot = await getDocs(strokesRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      window.location.reload(); 
    } catch (error) {
      console.error("Error clearing shirt:", error);
      alert("Failed to clear shirt.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <header className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-fit md:w-[90%] md:max-w-4xl glass-panel px-3 py-2 md:px-6 md:py-4 flex items-center justify-between shadow-2xl shadow-primary/10 border-white/60 rounded-full md:rounded-[2rem] gap-3 md:gap-4 backdrop-blur-3xl bg-white/70 md:bg-white/50">
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="bg-primary/10 p-1.5 md:p-2 rounded-full shadow-inner flex items-center justify-center shrink-0">
          <PenTool className="w-4 h-4 md:w-6 md:h-6 text-primary" />
        </div>
        <div className="hidden md:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate max-w-[200px] md:max-w-xs">
            Welcome to {ownerName ? `${ownerName}'s` : "My"} Signout
          </h1>
          <p className="text-xs text-slate-500 font-medium">Leave a mark for my final year!</p>
        </div>
        <div className="block md:hidden">
          <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate max-w-[100px] sm:max-w-[140px]">
            {ownerName ? `${ownerName}'s` : "My"} Signout
          </h1>
        </div>
      </div>
      <div className="tour-share-buttons flex items-center gap-2 md:gap-3 shrink-0">
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-white bg-slate-800 hover:bg-black px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-slate-800/30 active:scale-95 whitespace-nowrap"
          title="Download snapshot"
        >
          <Camera className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isDownloading ? 'animate-pulse' : ''}`} />
          <span className="hidden md:inline">{isDownloading ? "Saving..." : "Snapshot"}</span>
        </button>

        <button 
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-white bg-primary hover:bg-primary/90 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-primary/30 active:scale-95 whitespace-nowrap"
        >
          <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="hidden md:inline">{copied ? "Copied!" : "Share Link"}</span>
          <span className="inline md:hidden">{copied ? "Copied" : "Share"}</span>
        </button>
        {isOwner && (
          <button 
            onClick={handleClear}
            disabled={isClearing}
            className={`flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 shadow-sm border border-rose-100 hover:border-transparent active:scale-95 whitespace-nowrap ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Clear entire shirt"
          >
            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden md:inline">{isClearing ? "Clearing..." : "Clear"}</span>
          </button>
        )}
      </div>
    </header>
  );
}
