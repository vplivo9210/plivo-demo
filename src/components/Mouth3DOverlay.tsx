import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MouthShape } from '../types';

interface Mouth3DOverlayProps {
  mouthOpenness: number;
  mouthShape: MouthShape;
  // Position relative to model center (adjust based on your model)
  position?: [number, number, number];
  // Scale multiplier
  scale?: number;
}

export function Mouth3DOverlay({
  mouthOpenness,
  mouthShape,
  position = [0, 0.15, 0.52], // Default: centered, slightly above middle, in front
  scale = 1,
}: Mouth3DOverlayProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const tongueRef = useRef<THREE.Mesh>(null);

  // Target values for smooth interpolation
  const targetRef = useRef({ width: 0.08, height: 0.02 });

  useFrame((_, delta) => {
    if (!mouthRef.current) return;

    // Calculate target dimensions based on openness
    const baseWidth = 0.08 * scale;
    const maxWidth = 0.15 * scale;
    const minHeight = 0.01 * scale;
    const maxHeight = 0.1 * scale;

    targetRef.current.width = baseWidth + mouthOpenness * (maxWidth - baseWidth);
    targetRef.current.height = minHeight + mouthOpenness * (maxHeight - minHeight);

    // Smooth interpolation
    const smoothing = 1 - Math.pow(0.001, delta);
    const currentScale = mouthRef.current.scale;

    currentScale.x = THREE.MathUtils.lerp(
      currentScale.x,
      targetRef.current.width,
      smoothing
    );
    currentScale.y = THREE.MathUtils.lerp(
      currentScale.y,
      targetRef.current.height,
      smoothing
    );

    // Show/hide tongue based on openness and shape
    if (tongueRef.current) {
      const showTongue = mouthShape === 'wide' && mouthOpenness > 0.6;
      tongueRef.current.visible = showTongue;

      if (showTongue) {
        // Animate tongue slightly
        tongueRef.current.scale.y = 0.5 + Math.sin(Date.now() * 0.005) * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Mouth - dark ellipse/rounded rectangle */}
      <mesh ref={mouthRef} scale={[0.08, 0.02, 0.02]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Tongue - pink ellipse inside mouth */}
      <mesh
        ref={tongueRef}
        position={[0, -0.02 * scale, 0.01]}
        scale={[0.04 * scale, 0.02 * scale, 0.01 * scale]}
        visible={false}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color="#e57373"
          roughness={0.6}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
