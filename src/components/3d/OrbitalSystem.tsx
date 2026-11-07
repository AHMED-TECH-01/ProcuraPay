import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const OrbitalSystem: React.FC = () => {
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.18;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.12;
    if (ring3Ref.current) ring3Ref.current.rotation.z += delta * 0.08;
  });

  return (
    <group>
      {/* Orbital Ring 1: Primary Inner Plane */}
      <group ref={ring1Ref} rotation={[Math.PI / 4, 0.25, 0]}>
        <mesh>
          <torusGeometry args={[2.2, 0.014, 16, 120]} />
          <meshStandardMaterial
            color="#187B61"
            emissive="#34D399"
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.8}
            transparent={true}
            opacity={0.75}
          />
        </mesh>
      </group>

      {/* Orbital Ring 2: Secondary Mid Plane */}
      <group ref={ring2Ref} rotation={[-Math.PI / 3.2, 0.45, 0]}>
        <mesh>
          <torusGeometry args={[3.0, 0.012, 16, 140]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.7}
            transparent={true}
            opacity={0.65}
          />
        </mesh>
      </group>

      {/* Orbital Ring 3: Outer Distal Plane */}
      <group ref={ring3Ref} rotation={[0.4, -Math.PI / 3.8, 0]}>
        <mesh>
          <torusGeometry args={[3.8, 0.01, 16, 160]} />
          <meshStandardMaterial
            color="#6EE7B7"
            emissive="#059669"
            emissiveIntensity={0.25}
            roughness={0.4}
            metalness={0.6}
            transparent={true}
            opacity={0.5}
          />
        </mesh>
      </group>
    </group>
  );
};
