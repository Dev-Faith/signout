"use client";

import React, { useState } from "react";
import { PenTool, Share2, Trash2 } from "lucide-react";
import { collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function Header({ userId, isOwner }: { userId: string, isOwner: boolean }) {
  const [copied, setCopied] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      window.location.reload(); // Reload to clear the local canvas
    } catch (error) {
      console.error("Error clearing shirt:", error);
      alert("Failed to clear shirt.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <header className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-4xl glass-panel px-6 py-4 flex items-center justify-between shadow-lg border-white/40">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg shadow-inner">
          <PenTool className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to Muyiwa's Signout
          </h1>
          <p className="text-xs text-slate-500 font-medium">Leave a mark for my final year!</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-primary/30 active:scale-95"
        >
          <Share2 className="w-4 h-4" />
          {copied ? "Copied!" : "Share Link"}
        </button>
        {isOwner && (
          <button 
            onClick={handleClear}
            disabled={isClearing}
            className={`flex items-center gap-2 text-sm font-semibold text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 px-4 py-2 rounded-full transition-all duration-300 shadow-sm border border-rose-100 hover:border-transparent active:scale-95 ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Clear entire shirt (Owner only)"
          >
            <Trash2 className="w-4 h-4" />
            {isClearing ? "Clearing..." : "Clear"}
          </button>
        )}
      </div>
    </header>
  );
}
