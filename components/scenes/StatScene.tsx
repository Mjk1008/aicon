"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

/**
 * variant:
 *  - "collapse" → 95% (a tall pillar that is fractured)
 *  - "glow"     → 6%  (a small bright orb amid dim cloud)
 *  - "wave"     → 88% (a particle plane wave)
 *  - "dissolve" → 42% (a wireframe shape with scattered fragments)
 */
type Variant = "collapse" | "glow" | "wave" | "dissolve";

function Collapse() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (groupRef.current) groupRef.current.rotation.y = s.clock.elapsedTime * 0.2;
  });
  return (
    <group ref={groupRef}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.4 - 1.5, 0]} rotation={[0, (i * Math.PI) / 6, 0]}>
          <boxGeometry args={[1.2 - i * 0.08, 0.3, 1.2 - i * 0.08]} />
          <meshStandardMaterial
            color="#ff6b5b"
            emissive="#ff6b5b"
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={1 - i * 0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

function Glow() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = s.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = s.clock.elapsedTime * 0.4;
    }
  });
  return (
    <Float speed={2} floatIntensity={1}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color="#c8ff5f"
          emissive="#c8ff5f"
          emissiveIntensity={1.2}
          metalness={1}
          roughness={0.1}
        />
      </mesh>
      <pointLight color="#c8ff5f" intensity={3} distance={6} />
    </Float>
  );
}

function Wave() {
  const ref = useRef<THREE.Points>(null);
  const count = 1200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
  }
  useFrame((s) => {
    if (ref.current) {
      const t = s.clock.elapsedTime;
      const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setY(i, Math.sin(x * 1.2 + t) * 0.4 + Math.cos(z * 1.2 + t * 0.7) * 0.3);
      }
      pos.needsUpdate = true;
      ref.current.rotation.y = t * 0.08;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial color="#c8ff5f" size={0.025} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

function Dissolve() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = s.clock.elapsedTime * 0.15;
      groupRef.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.3) * 0.1;
    }
  });
  return (
    <group ref={groupRef}>
      <mesh>
        <torusKnotGeometry args={[0.8, 0.22, 100, 16]} />
        <meshBasicMaterial color="#ff6b5b" wireframe transparent opacity={0.45} />
      </mesh>
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const r = 1.5 + Math.random() * 1.2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * r, (Math.random() - 0.5) * 2, Math.sin(angle) * r]}
          >
            <tetrahedronGeometry args={[0.06]} />
            <meshBasicMaterial color="#ff6b5b" transparent opacity={Math.random() * 0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

export function StatScene({ variant }: { variant: Variant }) {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.5]} style={{ background: "transparent" }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={0.8} />
        {variant === "collapse" && <Collapse />}
        {variant === "glow" && <Glow />}
        {variant === "wave" && <Wave />}
        {variant === "dissolve" && <Dissolve />}
      </Suspense>
    </Canvas>
  );
}
