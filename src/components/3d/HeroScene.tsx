import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { ProcurementCore } from './ProcurementCore';
import { OrbitalSystem } from './OrbitalSystem';
import { FloatingNodes } from './FloatingNodes';
import { SceneFallback } from './SceneFallback';

// Parallax Controller Component
const ParallaxRig: React.FC<{ mousePos: { x: number; y: number } }> = ({ mousePos }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Gentle spring lerp toward mouse target
      const targetX = (mousePos.x * Math.PI) / 16;
      const targetY = (-mousePos.y * Math.PI) / 16;
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetX,
        3,
        delta
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        targetY,
        3,
        delta
      );
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.6}>
        <ProcurementCore />
        <OrbitalSystem />
        <FloatingNodes />
      </Float>
    </group>
  );
};

// Error Boundary for WebGL Context Loss / Crash
class WebGLErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('WebGL Rendering fallback triggered:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface HeroSceneProps {
  className?: string;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ className = '' }) => {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      setHasWebGL(!!gl);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  if (hasWebGL === false) {
    return <SceneFallback className={className} />;
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-[540px] lg:h-[620px] rounded-3xl overflow-hidden select-none ${className}`}
    >
      {/* Background Radial Glow Backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-[480px] h-[480px] rounded-full bg-emerald-400/12 blur-3xl" />
        <div className="w-[300px] h-[300px] rounded-full bg-[#187B61]/15 blur-2xl" />
      </div>

      <WebGLErrorBoundary fallback={<SceneFallback />}>
        <Suspense fallback={<SceneFallback />}>
          <Canvas
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15,
            }}
            dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
            camera={{ position: [0, 0, 7.5], fov: 42 }}
            className="w-full h-full"
          >
            {/* Lighting Studio Rig */}
            <ambientLight intensity={1.1} />
            {/* Primary Key Light */}
            <directionalLight
              position={[6, 8, 5]}
              intensity={2.2}
              color="#FFFFFF"
              castShadow
            />
            {/* Fill Light with Emerald tint */}
            <directionalLight
              position={[-6, -4, -4]}
              intensity={1.4}
              color="#34D399"
            />
            {/* Soft Rim Light */}
            <directionalLight
              position={[0, -6, 6]}
              intensity={0.8}
              color="#E0F2FE"
            />

            <PerspectiveCamera makeDefault position={[0, 0, 7.5]} fov={42} />

            <ParallaxRig mousePos={mousePos} />
          </Canvas>
        </Suspense>
      </WebGLErrorBoundary>
    </div>
  );
};
