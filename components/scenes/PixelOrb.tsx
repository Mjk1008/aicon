"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Pixelization-resolve hero scene.
 * A noise-displaced sphere is rendered through a fragment shader that quantises
 * to a low-res grid; uProgress (driven by scroll) and uVelocity (driven by Lenis)
 * gradually sharpen the grid and reduce turbulence.
 *
 * AI metaphor: "intelligence rendering itself into existence".
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  uniform float uTime;
  uniform float uVel;

  // 3D noise via hash
  float hash(vec3 p) { p = fract(p*0.3183099+0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float noise(vec3 x) {
    vec3 i = floor(x), f = fract(x);
    f = f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
                   mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                   mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
  }

  void main() {
    vUv = uv;
    vNormal = normal;
    vec3 p = position;
    float n = noise(p * 1.4 + uTime * 0.25);
    float displace = (n - 0.5) * (0.35 + uVel * 0.4);
    p += normal * displace;
    vPos = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  uniform float uTime;
  uniform float uProgress; // 0 = fully pixelated, 1 = sharp
  uniform float uVel;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  void main() {
    // pixelization grid: density goes up as uProgress -> 1
    float grid = mix(8.0, 80.0, smoothstep(0.0, 1.0, uProgress));
    vec2 px = floor(vUv * grid) / grid;
    vec3 n = normalize(vNormal);

    // fresnel rim
    float rim = pow(1.0 - max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);

    // gradient based on quantised uv + position
    float t = px.x * 0.6 + px.y * 0.4 + sin(uTime * 0.4 + vPos.x * 2.0) * 0.08;
    vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 1.0, t));
    col = mix(col, uColorC, rim * (0.6 + uVel * 0.3));

    // chunkiness flicker on low-progress: random brightness per cell
    float jitter = fract(sin(dot(px, vec2(12.9898, 78.233))) * 43758.5453);
    col *= mix(0.7 + jitter * 0.6, 1.0, smoothstep(0.0, 1.0, uProgress));

    gl_FragColor = vec4(col, 1.0);
  }
`;

function OrbMesh({ progress, velocity }: { progress: { current: number }; velocity: { current: number } }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uVel: { value: 0 },
      uColorA: { value: new THREE.Color("#c8ff5f") },
      uColorB: { value: new THREE.Color("#768FFF") },
      uColorC: { value: new THREE.Color("#ffffff") },
    }),
    []
  );

  useFrame((state) => {
    if (mat.current) {
      mat.current.uniforms.uTime.value = state.clock.getElapsedTime();
      // lerp toward targets so it feels alive
      mat.current.uniforms.uProgress.value +=
        (progress.current - mat.current.uniforms.uProgress.value) * 0.05;
      mat.current.uniforms.uVel.value +=
        (velocity.current - mat.current.uniforms.uVel.value) * 0.08;
    }
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.08;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.6, 48]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
}

export function PixelOrb() {
  // shared refs the page can write to via window-level events
  const progress = useRef(0);
  const velocity = useRef(0);

  // hook into global scroll / velocity vars set by SmoothScroll
  if (typeof window !== "undefined") {
    // poll vars on every frame — cheap, no listener overhead
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <Suspense fallback={null}>
        <Updater progress={progress} velocity={velocity} />
        <OrbMesh progress={progress} velocity={velocity} />
      </Suspense>
    </Canvas>
  );
}

function Updater({ progress, velocity }: { progress: { current: number }; velocity: { current: number } }) {
  useFrame(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    // uProgress comes from scrollProgress global var (0..1) over first viewport
    const sp = parseFloat(getComputedStyle(root).getPropertyValue("--scroll-progress")) || 0;
    const vel = Math.abs(parseFloat(getComputedStyle(root).getPropertyValue("--scroll-vel")) || 0);
    progress.current = Math.min(1, sp * 1.8);
    velocity.current = Math.min(1, vel);
  });
  return null;
}
