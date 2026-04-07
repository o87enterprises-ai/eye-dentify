import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { MeshDistortMaterial, Ring } from '@react-three/drei';

function ScanningIris({ isAnalyzing, alertLevel }) {
  const meshRef = useRef();
  const ringRef = useRef();

  // Color logic based on alert level
  const coreColor = alertLevel > 70 ? "#FF3B3B" : alertLevel > 40 ? "#D4AF37" : "#00D1FF";

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Rotate the outer ring (digital fingerprint)
    ringRef.current.rotation.z += isAnalyzing ? 0.05 : 0.01;
    // Pulse the core
    meshRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
  });

  return (
    <group>
      {/* The Pupil (The "Eye" Core) */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <MeshDistortMaterial
          color={coreColor}
          speed={isAnalyzing ? 5 : 2}
          distort={0.3}
          radius={1}
        />
      </mesh>

      {/* The Digital Iris Ring (Inspired by Logo) */}
      <Ring ref={ringRef} args={[1.8, 2.0, 64]} position={[0, 0, 0.1]}>
        <meshStandardMaterial
          color="#D4AF37"
          emissive="#D4AF37"
          emissiveIntensity={2}
          wireframe
        />
      </Ring>

      {/* Floating Data Points (Anomalies) */}
      {[...Array(12)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 0.5) * 2.5,
            Math.cos(i * 0.5) * 2.5,
            Math.sin(i * 0.3) * 0.5
          ]}
        >
          <sphereGeometry args={[0.02]} />
          <meshBasicMaterial color="#00D1FF" />
        </mesh>
      ))}
    </group>
  );
}

export default function ForensicCanvas({ isAnalyzing = false, alertLevel = 0 }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 5] }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#00D1FF" intensity={0.8} />
        <pointLight position={[-10, -10, 5]} color="#D4AF37" intensity={0.3} />
        <ScanningIris isAnalyzing={isAnalyzing} alertLevel={alertLevel} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
