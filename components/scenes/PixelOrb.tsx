"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";

/**
 * AIcon brand core — 3D mark for the hero.
 * Composition (original, my own geometric composition):
 *   - outer wireframe icosahedron (boundary)
 *   - inner wireframe at a different rotation
 *   - bright center cube (intelligence)
 *   - 8-cube orbital ring (echoes the brand-mark / favicon)
 *   - subtle 6-segment vertical halo lines
 */
function Core() {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const centerRef = useRef<THREE.Mesh>(null);

  const ringPositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      arr.push([Math.cos(a) * 2.4, 0, Math.sin(a) * 2.4]);
    }
    return arr;
  }, []);

  useFrame((s) => {
    const t = s.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18;
      groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.25;
      ringRef.current.rotation.y = t * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -t * 0.4;
      innerRef.current.rotation.z = t * 0.3;
    }
    if (centerRef.current) {
      // gentle scale pulse
      const s2 = 1 + Math.sin(t * 1.6) * 0.06;
      centerRef.current.scale.set(s2, s2, s2);
    }
  });

  return (
    <group ref={groupRef}>
      {/* outer wireframe icosahedron */}
      <mesh>
        <icosahedronGeometry args={[2, 1]} />
        <meshBasicMaterial color="#c8ff5f" wireframe transparent opacity={0.5} />
      </mesh>

      {/* inner wireframe — second layer */}
      <mesh ref={innerRef} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
        <icosahedronGeometry args={[1.4, 0]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.22} />
      </mesh>

      {/* bright center cube */}
      <mesh ref={centerRef}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#c8ff5f"
          emissiveIntensity={1.6}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* 8-cube orbital ring — echoes the brand mark */}
      <group ref={ringRef}>
        {ringPositions.map((pos, i) => (
          <mesh key={i} position={pos}>
            <boxGeometry args={[0.26, 0.26, 0.26]} />
            <meshStandardMaterial
              color="#c8ff5f"
              emissive="#c8ff5f"
              emissiveIntensity={0.7}
              roughness={0.25}
              metalness={0.4}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function PixelOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#c8ff5f" distance={6} />
        <pointLight position={[4, 3, 4]} intensity={0.6} color="#768FFF" />
        <pointLight position={[-4, -2, 3]} intensity={0.4} color="#ffffff" />
        <Core />
      </Suspense>
    </Canvas>
  );
}
