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
  // big & dense — fills the viewport, lots of edges to cull from
  const ico = new THREE.IcosahedronGeometry(4.2, 3);
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
  const groupRef = useRef<THREE.Group>(null);
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
    if (!matRef.current || !groupRef.current) return;
    const root = document.documentElement;
    const target =
      parseFloat(getComputedStyle(root).getPropertyValue("--reduction-progress")) || 0;
    cur.current.progress += (target - cur.current.progress) * 0.08;
    const p = cur.current.progress;
    matRef.current.uniforms.uProgress.value = p;

    const t = s.clock.elapsedTime;

    // BIG OBJECT SWIMMING BEHIND THE CONTENT
    // Drifts from below the viewport (y = -10) up through center to above (y = +8)
    // as scroll progresses. Slight x sway + continuous rotation give a "swimming" feel.
    groupRef.current.position.y = THREE.MathUtils.lerp(-10, 8, p);
    groupRef.current.position.x = Math.sin(p * Math.PI * 1.2) * 1.5; // gentle lateral sway
    groupRef.current.position.z = THREE.MathUtils.lerp(0, -1.5, p); // drifts slightly back
    groupRef.current.rotation.y = p * Math.PI * 0.9 + Math.sin(t * 0.1) * 0.1;
    groupRef.current.rotation.x = Math.sin(p * Math.PI) * 0.25 + Math.cos(t * 0.15) * 0.05;
    groupRef.current.rotation.z = Math.sin(p * Math.PI * 1.4) * 0.18;

    if (cubeRef.current && cubeMatRef.current) {
      const sc = 0.8 + p * 1.2 + Math.sin(t * 1.6) * 0.05;
      cubeRef.current.scale.set(sc, sc, sc);
      cubeRef.current.rotation.x = t * 0.4;
      cubeRef.current.rotation.z = t * 0.3;
      cubeMatRef.current.emissiveIntensity = 0.2 + p * 2.4;
      cubeMatRef.current.opacity = p;
    }
  });

  return (
    <group ref={groupRef}>
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
        <boxGeometry args={[0.9, 0.9, 0.9]} />
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
      camera={{ position: [0, 0, 3.5], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 2]} intensity={3} color="#c8ff5f" distance={8} />
        <Reduction />
      </Suspense>
    </Canvas>
  );
}
