"use client";

import React from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shirt } from "lucide-react";

export default function Home() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push(`/shirt/${user.uid}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <main className="w-full h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10 mix-blend-multiply animate-pulse animation-delay-2000" />
      
      <div className="glass-panel p-10 flex flex-col items-center gap-6 max-w-md w-full text-center shadow-2xl border-white/50 relative">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2 shadow-inner">
          <Shirt className="w-10 h-10 text-primary" />
        </div>
        
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            E-Shirt Signout
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Create your very own 3D virtual signout shirt. Share the link with friends to let them sign it in real-time!
          </p>
        </div>

        <button 
          onClick={signIn}
          className="w-full mt-4 bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5 bg-white rounded-full p-1" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        
        <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-4">
          Powered by Firebase
        </p>
      </div>
      
      {/* Courtesy Badge */}
      <a 
        href="https://muyiwa.dev" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute bottom-6 right-8 glass-panel px-4 py-2 rounded-full flex items-center gap-2 hover:scale-105 transition-transform duration-300 shadow-md group z-20 cursor-pointer"
      >
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">
          Courtesy of Muyiwa
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-primary transition-colors">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
    </main>
  );
}
