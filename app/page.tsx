"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Shirt, ChevronRight, Check, Sparkles } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { ShirtModel } from "@/components/ShirtModel";

const DESIGNS = [
  { id: "glory.png", name: "Glory" },
  { id: "designs/crown.png", name: "Crown" },
  { id: "designs/wings.png", name: "Wings" },
  { id: "designs/star.png", name: "Star" }
];

export default function Home() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  
  const [checkingDb, setCheckingDb] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  
  const [customText, setCustomText] = useState("Class of 2026");
  const [ownerName, setOwnerName] = useState("");
  const [selectedDesign, setSelectedDesign] = useState("glory.png");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function checkUserShirt() {
      if (user && !loading) {
        setCheckingDb(true);
        try {
          const docRef = doc(db, "shirts", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            router.push(`/shirt/${user.uid}`);
          } else {
            setNeedsOnboarding(true);
          }
        } catch (error) {
          console.error("Error checking db", error);
        } finally {
          setCheckingDb(false);
        }
      }
    }
    checkUserShirt();
  }, [user, loading, router]);

  const handleCreateShirt = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "shirts", user.uid), {
        text: customText,
        design: selectedDesign,
        ownerName: ownerName.trim(),
        createdAt: Date.now()
      });
      router.push(`/shirt/${user.uid}`);
    } catch (error) {
      console.error("Error saving shirt", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="w-full h-[100dvh] bg-slate-50 relative overflow-hidden flex flex-col lg:flex-row">
      {/* Decorative background elements (Desktop) */}
      <div className="hidden lg:block absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse animation-delay-2000" />
      </div>

      {/* RIGHT SIDE (Mobile Background / Desktop Right Split): Interactive 3D Hero */}
      <div className="absolute inset-0 lg:relative lg:inset-auto w-full lg:w-1/2 h-full z-0 lg:order-last">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/90 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-slate-50 pointer-events-none z-10" />
        
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
          <spotLight position={[-10, 5, 10]} angle={0.2} penumbra={1} intensity={0.5} color="#c084fc" />
          
          <Suspense fallback={null}>
            <ShirtModel 
              penColor="#000000" 
              penSize={5} 
              setIsDrawing={() => {}} 
              canSign={false} 
              mode="move" 
              userId="" 
              customText={needsOnboarding ? customText : "3D Signout"} 
              customDesign={needsOnboarding ? selectedDesign : "glory.png"}
            />
            <Environment preset="city" />
            <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
          </Suspense>

          <OrbitControls 
            autoRotate 
            autoRotateSpeed={1.5} 
            enableZoom={false} 
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* LEFT SIDE (Mobile Foreground / Desktop Left Split): Content & Authentication */}
      <div className="relative w-full lg:w-1/2 h-full flex flex-col justify-end lg:justify-center items-center pb-12 pt-6 px-6 lg:p-20 z-10 lg:order-first pointer-events-none overflow-y-auto no-scrollbar">
        
        {!needsOnboarding ? (
          <div className="glass-panel p-8 lg:p-14 flex flex-col items-center gap-6 lg:gap-8 w-full max-w-lg text-center shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border-white/60 backdrop-blur-3xl bg-white/70 lg:bg-white/40 rounded-3xl relative pointer-events-auto mt-auto lg:mt-0 transform transition-all">
            <div className="hidden lg:flex absolute -top-6 -right-6 bg-gradient-to-br from-yellow-300 to-yellow-500 w-16 h-16 rounded-full shadow-lg items-center justify-center animate-bounce animation-delay-500">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center shadow-inner border border-white/50 shrink-0">
              <Shirt className="w-10 h-10 lg:w-12 lg:h-12 text-primary" strokeWidth={1.5} />
            </div>
            
            <div className="space-y-2 lg:space-y-4">
              <h1 className="text-3xl lg:text-5xl font-black bg-gradient-to-br from-slate-900 via-primary to-accent bg-clip-text text-transparent leading-tight tracking-tight">
                E-Shirt Signout
              </h1>
              <p className="text-slate-600 lg:text-slate-500 text-sm lg:text-lg font-medium leading-relaxed max-w-sm mx-auto">
                Create a stunning 3D virtual signout shirt. Share your unique link and let your friends draw on it in real-time!
              </p>
            </div>

            <button 
              onClick={signIn}
              className="w-full mt-2 lg:mt-4 bg-slate-900 text-white font-bold py-3.5 lg:py-4 px-6 lg:px-8 rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 border border-slate-700 overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-center gap-3 z-10">
                <div className="bg-white rounded-full p-1 shadow-sm">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <span className="text-base lg:text-lg">Continue with Google</span>
              </div>
            </button>
            
            <p className="text-[9px] lg:text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mt-1 lg:mt-2">
              Secured by Firebase
            </p>
          </div>
        ) : (
          <div className="glass-panel p-6 lg:p-10 w-full max-w-lg shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border-white/60 backdrop-blur-3xl bg-white/70 lg:bg-white/40 rounded-3xl relative pointer-events-auto mt-auto lg:mt-0">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Shirt className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black text-slate-800">Design Your Shirt</h2>
            </div>
            
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-2 lg:space-y-3">
                <label className="block text-xs lg:text-sm font-bold text-slate-600 uppercase tracking-wider">Your Nickname</label>
                <input 
                  type="text" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  maxLength={15}
                  className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-xl lg:rounded-2xl border-2 border-slate-100 bg-white/70 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold text-slate-800 shadow-inner text-sm lg:text-base"
                  placeholder="e.g. Muyiwa"
                />
              </div>

              <div className="space-y-2 lg:space-y-3">
                <label className="block text-xs lg:text-sm font-bold text-slate-600 uppercase tracking-wider">Chest Text</label>
                <input 
                  type="text" 
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  maxLength={25}
                  className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-xl lg:rounded-2xl border-2 border-slate-100 bg-white/70 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold text-slate-800 shadow-inner text-sm lg:text-base"
                  placeholder="e.g. Class of 2026"
                />
              </div>

              <div className="space-y-2 lg:space-y-3">
                <label className="block text-xs lg:text-sm font-bold text-slate-600 uppercase tracking-wider">Front Graphic</label>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  {DESIGNS.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDesign(d.id)}
                      className={`relative p-3 lg:p-5 rounded-xl lg:rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 lg:gap-3 ${selectedDesign === d.id ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.02]' : 'border-white bg-white/50 hover:border-slate-200 hover:bg-white shadow-sm hover:shadow-md'}`}
                    >
                      <img src={`/${d.id}`} alt={d.name} className="w-10 h-10 lg:w-16 lg:h-16 object-contain mix-blend-multiply opacity-90" />
                      <span className={`text-xs lg:text-sm font-bold ${selectedDesign === d.id ? 'text-primary' : 'text-slate-500'}`}>{d.name}</span>
                      
                      {selectedDesign === d.id && (
                        <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1 shadow-md animate-in zoom-in duration-200">
                          <Check className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleCreateShirt}
                disabled={isSaving || !ownerName.trim()}
                className="w-full mt-2 lg:mt-4 bg-gradient-to-r from-primary to-accent text-white font-bold py-3.5 lg:py-5 px-6 lg:px-8 rounded-xl lg:rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span className="text-base lg:text-lg">{isSaving ? "Creating..." : "Create My Shirt"}</span>
                {!isSaving && <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Courtesy Badge */}
      <a 
        href="https://muyiwa.dev" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute top-6 right-6 lg:top-auto lg:bottom-6 lg:right-10 glass-panel px-4 py-2 lg:px-5 lg:py-2.5 rounded-full flex items-center gap-2 active:scale-95 lg:hover:scale-105 transition-all duration-300 shadow-lg group z-20 cursor-pointer border-white/60 bg-white/60 lg:bg-white/40 backdrop-blur-xl pointer-events-auto"
      >
        <span className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.15em] text-slate-700 lg:text-slate-600 group-hover:text-primary transition-colors">
          Courtesy of Muyiwa
        </span>
        <div className="bg-slate-200 group-hover:bg-primary/20 rounded-full p-1 lg:p-1.5 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 lg:text-slate-500 group-hover:text-primary transition-colors">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </div>
      </a>
    </main>
  );
}
