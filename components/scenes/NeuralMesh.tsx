"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

/** Particle cloud that reorganises with scroll velocity. The "Reasoning Engine". */

function Mesh() {
  const ref = useRef<THREE.Points>(null);
  const count = 1800;

  const { positions, targets } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // chaotic start in a sphere
      const r = 1.8 + Math.random() * 0.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      // ordered target on a torus knot-ish path
      const t = (i / count) * Math.PI * 6;
      targets[i * 3 + 0] = Math.cos(t) * (1.4 + 0.3 * Math.cos(t * 3));
      targets[i * 3 + 1] = Math.sin(t * 2) * 0.9;
      targets[i * 3 + 2] = Math.sin(t) * (1.4 + 0.3 * Math.cos(t * 3));
    }
    return { positions, targets };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const vel = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scroll-vel")) || 0;
    const sp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scroll-progress")) || 0;
    const mix = Math.min(1, Math.max(0, (sp - 0.35) * 2.5));
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const j = i * 3;
      const cx = positions[j];
      const cy = positions[j + 1];
      const cz = positions[j + 2];
      const tx = targets[j];
      const ty = targets[j + 1];
      const tz = targets[j + 2];
      // base lerp toward ordered target
      const lerped = mix;
      const wobble = vel * 0.6 + 0.04;
      pos.setXYZ(
        i,
        cx * (1 - lerped) + tx * lerped + Math.sin(t * 0.6 + i * 0.05) * wobble,
        cy * (1 - lerped) + ty * lerped + Math.cos(t * 0.7 + i * 0.07) * wobble,
        cz * (1 - lerped) + tz * lerped + Math.sin(t * 0.5 + i * 0.03) * wobble
      );
    }
    pos.needsUpdate = true;
    ref.current.rotation.y = t * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#c8ff5f" size={0.022} sizeAttenuation transparent opacity={0.9} />
    </points>
  );
}

export function NeuralMesh() {
  return (
    <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }} dpr={[1, 1.5]} style={{ background: "transparent" }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={1} color="#768FFF" />
        <Mesh />
      </Suspense>
    </Canvas>
  );
}
