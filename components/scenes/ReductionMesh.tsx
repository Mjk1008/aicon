"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Reduction scene — AIcon's brand thesis as motion.
 *
 * Start: a dense wireframe icosahedron (lots of lines = noise).
 * Scroll: lines with high seed values are culled progressively; survivors
 * gain opacity / brightness. End: a sparse skeleton of essential edges
 * around a glowing center cube.
 *
 * Driven by --reduction-progress on documentElement (0..1).
 */

function buildLineGeometry() {
  // higher detail = more lines to cull from
  const ico = new THREE.IcosahedronGeometry(2, 2);
  const edges = new THREE.EdgesGeometry(ico, 0);
  ico.dispose();

  const positions = edges.attributes.position.array as Float32Array;
  const vertexCount = positions.length / 3;
  const edgeCount = vertexCount / 2;
  const seeds = new Float32Array(vertexCount);

  for (let i = 0; i < edgeCount; i++) {
    const s = Math.random();
    seeds[i * 2] = s;
    seeds[i * 2 + 1] = s;
  }

  edges.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  edges.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 4);
  return edges;
}

const vertexShader = /* glsl */ `
  attribute float aSeed;
  uniform float uProgress;
  varying float vSeed;
  varying float vSurvive;

  void main() {
    vSeed = aSeed;

    // Survival threshold lowers as progress increases.
    // At progress 0: threshold ~1.0 (everyone survives).
    // At progress 1: threshold ~0.22 (only bottom 22% survive).
    float threshold = mix(1.0, 0.22, smoothstep(0.0, 1.0, uProgress));
    vSurvive = step(aSeed, threshold);

    if (vSurvive < 0.5) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // off-screen
      return;
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vSeed;
  varying float vSurvive;
  uniform float uProgress;
  uniform vec3 uColor;

  void main() {
    if (vSurvive < 0.5) discard;
    // baseline opacity rises with progress — survivors get brighter
    float base = mix(0.35, 1.0, smoothstep(0.0, 1.0, uProgress));
    // closer-to-cut edges fade slightly so it doesn't feel uniform
    float threshold = mix(1.0, 0.22, smoothstep(0.0, 1.0, uProgress));
    float near = clamp(vSeed / threshold, 0.0, 1.0);
    float op = base * (0.55 + (1.0 - near) * 0.45);
    gl_FragColor = vec4(uColor, op);
  }
`;

function Reduction() {
  const geom = useMemo(() => buildLineGeometry(), []);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const cubeRef = useRef<THREE.Mesh>(null);
  const cubeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const cur = useRef({ progress: 0 });

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uColor: { value: new THREE.Color("#c8ff5f") },
    }),
    []
  );

  useFrame((s) => {
    if (!matRef.current) return;
    const root = document.documentElement;
    const target =
      parseFloat(getComputedStyle(root).getPropertyValue("--reduction-progress")) || 0;
    cur.current.progress += (target - cur.current.progress) * 0.08;
    matRef.current.uniforms.uProgress.value = cur.current.progress;

    if (cubeRef.current && cubeMatRef.current) {
      const t = s.clock.elapsedTime;
      const sc = 0.5 + cur.current.progress * 0.7 + Math.sin(t * 1.6) * 0.04;
      cubeRef.current.scale.set(sc, sc, sc);
      cubeRef.current.rotation.x = t * 0.4;
      cubeRef.current.rotation.z = t * 0.3;
      cubeMatRef.current.emissiveIntensity = 0.2 + cur.current.progress * 2.2;
      cubeMatRef.current.opacity = 0.0 + cur.current.progress * 1.0;
    }
  });

  return (
    <group>
      <lineSegments geometry={geom}>
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
        />
      </lineSegments>
      <mesh ref={cubeRef}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          ref={cubeMatRef}
          color="#ffffff"
          emissive="#c8ff5f"
          emissiveIntensity={0.2}
          roughness={0.25}
          metalness={0.5}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  );
}

export function ReductionMesh() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2.5} color="#c8ff5f" distance={5} />
        <Reduction />
      </Suspense>
    </Canvas>
  );
}
