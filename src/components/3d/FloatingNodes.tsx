import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface NodeData {
  id: string;
  label: string;
  sublabel: string;
  radius: number;
  speed: number;
  phase: number;
  tiltX: number;
  tiltY: number;
  color: string;
  accent: string;
}

const NODES: NodeData[] = [
  {
    id: 'research',
    label: 'AI Product Research',
    sublabel: 'Specs & Availability Verified',
    radius: 2.2,
    speed: 0.35,
    phase: 0.2,
    tiltX: Math.PI / 4,
    tiltY: 0.25,
    color: '#D97706',
    accent: '#FBBF24',
  },
  {
    id: 'comparison',
    label: 'Vendor Comparison',
    sublabel: '3 Verified B2B Quotes',
    radius: 3.0,
    speed: -0.28,
    phase: 2.1,
    tiltX: -Math.PI / 3.2,
    tiltY: 0.45,
    color: '#0284C7',
    accent: '#38BDF8',
  },
  {
    id: 'policy',
    label: 'Policy Evaluation',
    sublabel: 'Budget Threshold Passed',
    radius: 3.0,
    speed: -0.28,
    phase: 5.2,
    tiltX: -Math.PI / 3.2,
    tiltY: 0.45,
    color: '#059669',
    accent: '#34D399',
  },
  {
    id: 'approval',
    label: 'Human Payment Auth',
    sublabel: '1-Click Secure Settlement',
    radius: 3.8,
    speed: 0.2,
    phase: 3.8,
    tiltX: 0.4,
    tiltY: -Math.PI / 3.8,
    color: '#0D9488',
    accent: '#2DD4BF',
  },
];

export const FloatingNodes: React.FC = () => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // References to node meshes
  const nodeRefs = useRef<{ [key: string]: THREE.Group | null }>({});
  const lineRefs = useRef<{ [key: string]: THREE.Line | null }>({});

  // Dynamic positions updated every frame
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    NODES.forEach((node) => {
      const angle = t * node.speed + node.phase;
      // Calculate position in orbital plane
      const planeX = Math.cos(angle) * node.radius;
      const planeZ = Math.sin(angle) * node.radius;

      // Apply orbital inclinations
      const v = new THREE.Vector3(planeX, 0, planeZ);
      v.applyAxisAngle(new THREE.Vector3(1, 0, 0), node.tiltX);
      v.applyAxisAngle(new THREE.Vector3(0, 1, 0), node.tiltY);

      const group = nodeRefs.current[node.id];
      if (group) {
        group.position.copy(v);
      }

      // Update connecting line geometry to center (0,0,0)
      const line = lineRefs.current[node.id];
      if (line) {
        const positions = line.geometry.attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, 0, 0, 0);
        positions.setXYZ(1, v.x, v.y, v.z);
        positions.needsUpdate = true;
      }
    });
  });

  return (
    <group>
      {NODES.map((node) => {
        const isHovered = hoveredNodeId === node.id;

        // Buffer geometry for dynamic line
        const lineGeo = useMemo(() => {
          const geo = new THREE.BufferGeometry();
          const pts = new Float32Array([0, 0, 0, 0, 0, 0]);
          geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
          return geo;
        }, []);

        return (
          <React.Fragment key={node.id}>
            {/* Dynamic Connecting Line to Core */}
            <primitive
              object={
                new THREE.Line(
                  lineGeo,
                  new THREE.LineBasicMaterial({
                    color: isHovered ? node.accent : '#187B61',
                    transparent: true,
                    opacity: isHovered ? 0.85 : 0.22,
                    linewidth: isHovered ? 2 : 1,
                  })
                )
              }
              ref={(el: THREE.Line | null) => {
                lineRefs.current[node.id] = el;
              }}
            />

            {/* Floating Satellite Node Group */}
            <group
              ref={(el) => {
                nodeRefs.current[node.id] = el;
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredNodeId(node.id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredNodeId(null);
                document.body.style.cursor = 'default';
              }}
            >
              {/* Outer Halo */}
              <mesh>
                <sphereGeometry args={[isHovered ? 0.18 : 0.13, 16, 16]} />
                <meshStandardMaterial
                  color={node.color}
                  emissive={node.accent}
                  emissiveIntensity={isHovered ? 1.5 : 0.8}
                  roughness={0.2}
                  metalness={0.8}
                />
              </mesh>

              {/* Orbital Pulse Ring */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[isHovered ? 0.24 : 0.18, isHovered ? 0.28 : 0.21, 24]} />
                <meshBasicMaterial
                  color={node.accent}
                  transparent={true}
                  opacity={isHovered ? 0.9 : 0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Point light for active node radiance */}
              <pointLight
                color={node.accent}
                intensity={isHovered ? 1.2 : 0.4}
                distance={2}
              />

              {/* Interactive Tooltip on Hover */}
              {isHovered && (
                <Html
                  position={[0, 0.35, 0]}
                  center
                  distanceFactor={10}
                  className="pointer-events-none"
                >
                  <div className="glass-panel px-3 py-1.5 rounded-lg shadow-lg border border-white/80 whitespace-nowrap text-left animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[11px] font-bold text-gray-900 flex items-center space-x-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: node.color }}
                      />
                      <span>{node.label}</span>
                    </div>
                    <div className="text-[9px] text-gray-500 font-medium">{node.sublabel}</div>
                  </div>
                </Html>
              )}
            </group>
          </React.Fragment>
        );
      })}
    </group>
  );
};
