import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ProcurementCore: React.FC = () => {
  const outerSphereRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Group>(null);
  const latticeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Smooth axial rotation
    if (outerSphereRef.current) {
      outerSphereRef.current.rotation.y += delta * 0.25;
      outerSphereRef.current.rotation.x = Math.sin(t * 0.3) * 0.08;
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y -= delta * 0.45;
      innerCoreRef.current.rotation.z = Math.cos(t * 0.4) * 0.15;
    }

    if (latticeRef.current) {
      latticeRef.current.rotation.x += delta * 0.15;
      latticeRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group>
      {/* Central Point Light with Emerald Radiance */}
      <pointLight color="#34D399" intensity={2.8} distance={8} decay={2} />
      <pointLight color="#187B61" intensity={1.5} distance={5} position={[0, -1, 0]} />

      {/* 1. Translucent Liquid Glass Outer Shell */}
      <mesh ref={outerSphereRef} castShadow receiveShadow>
        <sphereGeometry args={[1.35, 64, 64]} />
        <meshPhysicalMaterial
          color="#F0FDF4"
          roughness={0.08}
          metalness={0.05}
          transmission={0.92}
          thickness={1.4}
          ior={1.48}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          transparent={true}
          opacity={0.88}
          reflectivity={0.9}
        />
      </mesh>

      {/* 2. Inner Intelligent Geometric Core (Faceted Icosahedron) */}
      <group ref={innerCoreRef}>
        <mesh>
          <icosahedronGeometry args={[0.78, 0]} />
          <meshStandardMaterial
            color="#187B61"
            emissive="#10B981"
            emissiveIntensity={0.65}
            roughness={0.25}
            metalness={0.8}
            wireframe={false}
          />
        </mesh>

        {/* Emissive Wireframe Edge Accent */}
        <mesh>
          <icosahedronGeometry args={[0.82, 0]} />
          <meshBasicMaterial
            color="#A7F3D0"
            wireframe={true}
            transparent={true}
            opacity={0.45}
          />
        </mesh>
      </group>

      {/* 3. Subtle Concentric Micro Lattice */}
      <mesh ref={latticeRef}>
        <octahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial
          color="#34D399"
          wireframe={true}
          transparent={true}
          opacity={0.25}
        />
      </mesh>
    </group>
  );
};
