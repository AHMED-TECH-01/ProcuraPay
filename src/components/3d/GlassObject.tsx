import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface PrismMeshProps {
  color?: string;
  size?: number;
}

const PrismMesh: React.FC<PrismMeshProps> = ({
  color = '#187B61',
  size = 1,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.6;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.7;
      innerRef.current.rotation.y -= delta * 0.3;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.8}>
      <group scale={size}>
        <pointLight color="#34D399" intensity={2} distance={4} />

        {/* Outer Translucent Glass Facet */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#ECFDF5"
            roughness={0.08}
            metalness={0.1}
            transmission={0.9}
            thickness={1.2}
            ior={1.52}
            clearcoat={1.0}
            transparent={true}
            opacity={0.85}
          />
        </mesh>

        {/* Inner Glowing Core */}
        <mesh ref={innerRef}>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color={color}
            emissive="#10B981"
            emissiveIntensity={1.2}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Wireframe Accent */}
        <mesh>
          <octahedronGeometry args={[1.05, 0]} />
          <meshBasicMaterial
            color="#34D399"
            wireframe={true}
            transparent={true}
            opacity={0.35}
          />
        </mesh>
      </group>
    </Float>
  );
};

interface GlassObjectProps {
  size?: number;
  className?: string;
  color?: string;
}

export const GlassObject: React.FC<GlassObjectProps> = ({
  size = 64,
  className = '',
  color = '#187B61',
}) => {
  // WebGL support check
  const hasWebGL = React.useMemo(() => {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch {
      return false;
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100/60 to-teal-50/40 border border-emerald-500/20 shadow-xs ${className}`}
      >
        <div className="w-1/2 h-1/2 rounded-lg bg-[#187B61] rotate-45 animate-pulse-subtle opacity-80" />
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 pointer-events-none select-none ${className}`}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 5, 2]} intensity={2.0} color="#FFFFFF" />
        <directionalLight position={[-3, -3, -2]} intensity={0.8} color="#10B981" />
        <PrismMesh color={color} size={0.9} />
      </Canvas>
    </div>
  );
};
