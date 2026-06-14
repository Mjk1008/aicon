"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function MorphOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.1;
    meshRef.current.rotation.y = t * 0.15;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.6, 32]} />
        <MeshDistortMaterial
          color="#c8ff5f"
          emissive="#c8ff5f"
          emissiveIntensity={0.15}
          distort={0.45}
          speed={1.2}
          roughness={0.15}
          metalness={0.85}
          wireframe={false}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.85, 1]} />
        <meshBasicMaterial color="#c8ff5f" wireframe transparent opacity={0.12} />
      </mesh>
    </Float>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#c8ff5f" />
        <pointLight position={[-5, -3, 3]} intensity={0.8} color="#5fa8ff" />
        <MorphOrb />
        <Sparkles count={60} scale={8} size={2} speed={0.3} color="#c8ff5f" />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
