import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Viseme } from '../types';
import { useMascotLipSync } from '../hooks/useMascotLipSync';

interface MascotAvatarProps {
  currentViseme?: Viseme;
  jawRotation?: number;
  isPlaying: boolean;
  amplitude: number;
}

interface MascotModelProps {
  currentViseme?: Viseme;
  jawRotation?: number;
  isPlaying: boolean;
  amplitude: number;
}

const MODEL_PATH = '/assets/mascot/base_basic_pbr.glb';

function MascotModel({
  currentViseme = 'sil',
  jawRotation = 0,
  isPlaying,
}: MascotModelProps) {
  const { scene } = useGLTF(MODEL_PATH);
  const modelRef = useRef<THREE.Group>(null);

  const lipSync = useMascotLipSync({
    smoothingFactor: 0.3,
  });

  // Clone and setup the scene
  useEffect(() => {
    if (!scene) return;

    // Clone the scene to avoid mutations
    const clonedScene = scene.clone(true);

    // Fix materials
    clonedScene.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh) {
        // Fix materials
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.needsUpdate = true;
          child.material.side = THREE.DoubleSide;
        } else if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.needsUpdate = true;
              mat.side = THREE.DoubleSide;
            }
          });
        }

        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Add cloned scene to model ref
    if (modelRef.current) {
      // Clear previous children
      while (modelRef.current.children.length > 0) {
        modelRef.current.remove(modelRef.current.children[0]);
      }
      modelRef.current.add(clonedScene);
    }

    // Initialize lip sync
    lipSync.setModel(clonedScene);
  }, [scene]);

  // Update lip-sync every frame
  useFrame(() => {
    if (isPlaying) {
      lipSync.updateLipSync(currentViseme, jawRotation);
    }
  });

  return (
    <group ref={modelRef} scale={[1.5, 1.5, 1.5]} position={[0, -1.5, 0]}>
      {/* Model will be added here via useEffect */}
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"
            style={{ width: '60%' }}
          />
        </div>
        <span className="text-white/70 text-sm">Loading mascot...</span>
      </div>
    </Html>
  );
}

function SceneSetup() {
  const { gl } = useThree();

  useEffect(() => {
    // Set up proper color space for PBR materials
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
  }, [gl]);

  return null;
}

export function MascotAvatar({
  currentViseme = 'sil',
  jawRotation = 0,
  isPlaying,
  amplitude,
}: MascotAvatarProps) {
  return (
    <div className="relative">
      <div className="relative w-[350px] h-[400px]">
        <Canvas
          camera={{ position: [0, 0.5, 3], fov: 45 }}
          style={{ background: 'transparent' }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          <SceneSetup />

          {/* Lighting for PBR materials */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />
          <pointLight position={[0, 2, 3]} intensity={0.5} color="#ffffff" />
          <hemisphereLight
            args={['#ffffff', '#444444', 0.6]}
          />

          <Suspense fallback={<LoadingFallback />}>
            <MascotModel
              currentViseme={currentViseme}
              jawRotation={jawRotation}
              isPlaying={isPlaying}
              amplitude={amplitude}
            />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0.5, 0]}
          />
        </Canvas>

        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span
              className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
              style={{ animationDelay: '75ms' }}
            />
            <span
              className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
              style={{ animationDelay: '150ms' }}
            />
          </div>
        )}

        {/* Mode indicator */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/30 rounded text-xs text-white/70">
          3D Model
        </div>
      </div>
    </div>
  );
}

// Preload the model
useGLTF.preload(MODEL_PATH);
