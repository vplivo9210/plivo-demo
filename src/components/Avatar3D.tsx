import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';
import { MouthShape } from '../types';

interface Avatar3DProps {
  mouthShape: MouthShape;
  mouthOpenness: number;
  amplitude: number;
  isPlaying: boolean;
}

interface MascotModelProps {
  amplitude: number;
  isPlaying: boolean;
}

function MascotModel({ amplitude, isPlaying }: MascotModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/mascot/mascot.glb');

  // Clone the scene to avoid issues with multiple instances
  const clonedScene = scene.clone();

  // Find bones/skeleton if available
  const bonesRef = useRef<{ [key: string]: THREE.Bone }>({});
  const initialRotationsRef = useRef<{ [key: string]: THREE.Euler }>({});
  const timeRef = useRef(0);

  useEffect(() => {
    // Traverse the model to find bones
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Bone) {
        bonesRef.current[child.name] = child;
        initialRotationsRef.current[child.name] = child.rotation.clone();
      }
    });

    // Log bone names for debugging
    const boneNames = Object.keys(bonesRef.current);
    if (boneNames.length > 0) {
      console.log('Found bones:', boneNames);
    } else {
      console.log('No bones found in model - using group transform for animation');
    }
  }, [clonedScene]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const time = timeRef.current;

    if (!groupRef.current) return;

    // Normalize amplitude (0-1)
    const normalizedAmp = Math.min(1, amplitude / 70);

    if (isPlaying) {
      // Active speaking animations - more pronounced when amplitude is high
      const intensity = 0.3 + normalizedAmp * 0.7;

      // Head bob - faster and more pronounced when speaking louder
      const headBobSpeed = 3 + normalizedAmp * 4;
      const headBobAmount = 0.02 + normalizedAmp * 0.04;

      // Body sway
      const swaySpeed = 2 + normalizedAmp * 2;
      const swayAmount = 0.015 + normalizedAmp * 0.025;

      // If we have bones, animate them
      const bones = bonesRef.current;
      const headBone = bones['Head'] || bones['head'] || bones['mixamorigHead'];
      const spineBone = bones['Spine'] || bones['spine'] || bones['mixamorigSpine'];
      const leftArmBone = bones['LeftArm'] || bones['leftArm'] || bones['mixamorigLeftArm'];
      const rightArmBone = bones['RightArm'] || bones['rightArm'] || bones['mixamorigRightArm'];

      if (headBone) {
        // Animate head
        headBone.rotation.x = Math.sin(time * headBobSpeed) * headBobAmount * intensity;
        headBone.rotation.z = Math.sin(time * headBobSpeed * 0.7) * headBobAmount * 0.5 * intensity;
      }

      if (spineBone) {
        // Animate spine/torso
        spineBone.rotation.z = Math.sin(time * swaySpeed) * swayAmount * intensity;
      }

      if (leftArmBone) {
        // Wave left arm
        leftArmBone.rotation.z = Math.sin(time * 2.5) * 0.1 * intensity;
      }

      if (rightArmBone) {
        // Wave right arm (offset)
        rightArmBone.rotation.z = Math.sin(time * 2.5 + Math.PI) * 0.1 * intensity;
      }

      // Fallback: If no bones, animate the whole group
      if (Object.keys(bones).length === 0) {
        // Bob up and down
        groupRef.current.position.y = Math.sin(time * headBobSpeed) * 0.05 * intensity;
        // Slight rotation
        groupRef.current.rotation.z = Math.sin(time * swaySpeed) * 0.02 * intensity;
        groupRef.current.rotation.y = Math.sin(time * swaySpeed * 0.5) * 0.03 * intensity;
      }
    } else {
      // Idle breathing animation - subtle
      const breathSpeed = 1.5;
      const breathAmount = 0.01;

      // Reset bone rotations and apply subtle idle animation
      const bones = bonesRef.current;

      if (Object.keys(bones).length === 0) {
        // Fallback group animation
        groupRef.current.position.y = Math.sin(time * breathSpeed) * 0.02;
        groupRef.current.rotation.z = Math.sin(time * breathSpeed * 0.5) * 0.005;
      } else {
        // Subtle bone breathing
        const spineBone = bones['Spine'] || bones['spine'] || bones['mixamorigSpine'];
        if (spineBone) {
          spineBone.rotation.x = Math.sin(time * breathSpeed) * breathAmount;
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={2} />
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#667eea" />
    </mesh>
  );
}

export function Avatar3D({ mouthOpenness: _mouthOpenness, mouthShape: _mouthShape, amplitude, isPlaying }: Avatar3DProps) {
  // Note: mouthOpenness and mouthShape are passed but not currently used for 3D model
  // They can be used later for morph targets if the model supports them
  void _mouthOpenness;
  void _mouthShape;
  return (
    <div className="relative w-[350px] h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} />

        <Suspense fallback={<LoadingFallback />}>
          <Center>
            <MascotModel amplitude={amplitude} isPlaying={isPlaying} />
          </Center>
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Speaking indicator */}
      {isPlaying && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-75" />
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-150" />
        </div>
      )}
    </div>
  );
}

// Preload the model
useGLTF.preload('/assets/mascot/mascot.glb');
