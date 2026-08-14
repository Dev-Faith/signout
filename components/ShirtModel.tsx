"use client";

import React, { useRef, useState, useEffect } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { useGLTF, Decal } from "@react-three/drei";
import * as THREE from "three";
import { collection, addDoc, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ShirtModelProps {
  penColor: string;
  penSize: number;
  setIsDrawing: (drawing: boolean) => void;
  canSign: boolean;
  mode: "draw" | "move";
  userId: string;
  customText?: string;
  customDesign?: string;
}

export function ShirtModel({ penColor, penSize, setIsDrawing, canSign, mode, userId, customText, customDesign }: ShirtModelProps) {
  const { nodes, materials } = useGLTF("/shirt_baked.glb") as any;
  const meshRef = useRef<THREE.Mesh>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const [textureReady, setTextureReady] = useState(false);
  const [decalTexture, setDecalTexture] = useState<THREE.CanvasTexture | null>(null);
  const [gloryTexture, setGloryTexture] = useState<THREE.CanvasTexture | null>(null);
  const isDrawingRef = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const currentStrokeRef = useRef<{x: number, y: number}[]>([]);

  useEffect(() => {
    // Create an offscreen canvas for the main drawable texture
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff"; // base shirt color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    canvasRef.current = canvas;
    
    // Create texture and configure it
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    textureRef.current = texture;
    setTextureReady(true);
  }, []);

  useEffect(() => {
    // Create a separate canvas texture for the permanent text (Decal)
    const textToRender = customText || "Ògo nifún Krístì";
    const decalCanvas = document.createElement("canvas");
    decalCanvas.width = 1024;
    decalCanvas.height = 512; // wider for text
    const dctx = decalCanvas.getContext("2d");
    if (dctx) {
      document.fonts.ready.then(() => {
        dctx.font = "bold 100px 'Dancing Script', cursive";
        dctx.fillStyle = "#000000";
        dctx.textAlign = "center";
        dctx.textBaseline = "middle";
        dctx.fillText(textToRender, decalCanvas.width / 2, decalCanvas.height / 2);
        
        const dTex = new THREE.CanvasTexture(decalCanvas);
        dTex.colorSpace = THREE.SRGBColorSpace;
        dTex.anisotropy = 16;
        setDecalTexture(dTex);
      });
    }
  }, [customText]);

  useEffect(() => {
    // Process illustration to remove white background
    const designToRender = customDesign || "glory.png";
    const img = new Image();
    img.src = `/${designToRender}`;
    img.onload = () => {
      const gCanvas = document.createElement("canvas");
      gCanvas.width = img.width;
      gCanvas.height = img.height;
      const gctx = gCanvas.getContext("2d");
      if (gctx) {
        gctx.drawImage(img, 0, 0);
        const imgData = gctx.getImageData(0, 0, gCanvas.width, gCanvas.height);
        const data = imgData.data;
        // Make white pixels transparent and dark pixels pure black
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If close to white, make transparent
          if (r > 200 && g > 200 && b > 200) {
            data[i + 3] = 0; 
          } else {
            // Force remaining strokes to be pure black
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
          }
        }
        gctx.putImageData(imgData, 0, 0);
        const gTex = new THREE.CanvasTexture(gCanvas);
        gTex.colorSpace = THREE.SRGBColorSpace;
        gTex.anisotropy = 16;
        setGloryTexture(gTex);
      }
    };
  }, [customDesign]);

  // Firebase Real-time Listener
  useEffect(() => {
    if (!textureReady || !canvasRef.current || !textureRef.current || !userId) return;

    const q = query(collection(db, "shirts", userId, "strokes"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          // If we are the ones who wrote it, it might have pending writes. 
          // We can skip drawing it if we already drew it optimistically, but redrawing is harmless.
          if (change.doc.metadata.hasPendingWrites) return; 

          const data = change.doc.data();
          drawRemoteStroke(data);
        }
      });
    });

    return () => unsubscribe();
  }, [textureReady, userId]);

  const drawRemoteStroke = (data: any) => {
    if (!canvasRef.current || !textureRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    ctx.beginPath();
    const points = data.points;
    if (!points || points.length === 0) return;
    
    ctx.moveTo(points[0].x, points[0].y);
    if (points.length === 1) {
      ctx.lineTo(points[0].x, points[0].y);
    } else {
      for (let i = 1; i < points.length; i++) {
        ctx.moveTo(points[i-1].x, points[i-1].y);
        ctx.lineTo(points[i].x, points[i].y);
      }
    }
    ctx.stroke();
    textureRef.current.needsUpdate = true;
  };

  const drawOnCanvas = (uv: THREE.Vector2) => {
    if (!canvasRef.current || !textureRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Convert UV to canvas coordinates
    // Three.js UV origin is bottom-left, Canvas origin is top-left
    const x = uv.x * canvas.width;
    const y = (1 - uv.y) * canvas.height;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
    } else {
      // Start of a new stroke
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPos.current = { x, y };
    currentStrokeRef.current.push({ x, y });
    textureRef.current.needsUpdate = true;
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only allow left-click to draw
    if (!canSign || mode === "move") return; // Disallow drawing if not zoomed in or in move mode
    
    // Find intersection specifically with the base mesh, ignoring Decals
    const baseHit = e.intersections.find((hit) => hit.object === meshRef.current);
    if (baseHit && baseHit.uv) {
      isDrawingRef.current = true;
      setIsDrawing(true);
      drawOnCanvas(baseHit.uv);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDrawingRef.current) return;
    e.stopPropagation();
    
    const baseHit = e.intersections.find((hit) => hit.object === meshRef.current);
    if (baseHit && baseHit.uv) {
      drawOnCanvas(baseHit.uv);
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDrawingRef.current = false;
    setIsDrawing(false);
    lastPos.current = null;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    // Save stroke to Firebase
    if (currentStrokeRef.current.length > 0) {
      const strokeData = {
        color: penColor,
        size: penSize,
        points: currentStrokeRef.current,
        timestamp: Date.now()
      };
      
      addDoc(collection(db, "shirts", userId, "strokes"), strokeData).catch(console.error);
      currentStrokeRef.current = [];
    }
  };

  const handlePointerLeave = () => {
    isDrawingRef.current = false;
    setIsDrawing(false);
    lastPos.current = null;
    
    // Save stroke to Firebase if they leave the mesh while drawing
    if (currentStrokeRef.current.length > 0) {
      const strokeData = {
        color: penColor,
        size: penSize,
        points: currentStrokeRef.current,
        timestamp: Date.now()
      };
      
      addDoc(collection(db, "shirts", userId, "strokes"), strokeData).catch(console.error);
      currentStrokeRef.current = [];
    }
  };

  if (!textureReady || !textureRef.current) return null;

  return (
    <group 
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      dispose={null}
    >
      <mesh 
        ref={meshRef}
        geometry={nodes.T_Shirt_male.geometry} 
        material={materials.lambert1}
        position={[0, -0.5, 0]} 
        scale={2.5}
      >
        <meshStandardMaterial 
          map={textureRef.current} 
          roughness={0.8}
          metalness={0.1}
        />
        {decalTexture && (
          <Decal raycast={() => null} position={[0, 0.07, 0.14]} rotation={[0, 0, 0]} scale={[0.22, 0.11, 0.22]}>
            <meshStandardMaterial
              map={decalTexture}
              transparent
              depthTest={true}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </Decal>
        )}
        {gloryTexture && (
          <Decal raycast={() => null} position={[0, -0.01, 0.16]} rotation={[0, 0, 0]} scale={[0.18, 0.18, 0.18]}>
            <meshStandardMaterial
              map={gloryTexture}
              transparent
              depthTest={true}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-2}
            />
          </Decal>
        )}
      </mesh>
    </group>
  );
}

useGLTF.preload("/shirt_baked.glb");
