import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { MeshDistortMaterial, Ring } from '@react-three/drei';
import { TextureLoader, Color, AdditiveBlending } from 'three';

function LogoPlane({ isAnalyzing }) {
  const meshRef = useRef();
  // Load the actual logo texture
  const texture = useLoader(TextureLoader, '/logo.png');

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Subtle breathing animation
    const scale = 1 + Math.sin(t * 1.5) * 0.03;
    meshRef.current.scale.setScalar(scale);
    // Slow rotation
    meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      {/* Flat plane geometry for the logo - billboard style */}
      <planeGeometry args={[3.2, 3.2]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}

function OrbitingRing({ radius, speed, color, emissiveIntensity, tilt, wireframe = true }) {
  const ringRef = useRef();
  const segments = 64;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Orbit rotation
    ringRef.current.rotation.z += speed;
    ringRef.current.rotation.x = tilt;
    // Pulsing effect
    const pulse = 1 + Math.sin(t * 3) * 0.02;
    ringRef.current.scale.setScalar(pulse);
  });

  return (
    <Ring ref={ringRef} args={[radius, radius + 0.08, segments]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        wireframe={wireframe}
        transparent
        opacity={0.6}
      />
    </Ring>
  );
}

function FloatingDataPoints({ count = 20 }) {
  const pointsRef = useRef();

  // Pre-compute random positions
  const positions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2.5 + Math.random() * 1.5;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: (Math.random() - 0.5) * 1.5,
        orbitSpeed: 0.2 + Math.random() * 0.3,
        orbitRadius: radius,
        angle: angle,
        size: 0.01 + Math.random() * 0.03,
        color: Math.random() > 0.5 ? '#00D1FF' : '#D4AF37',
      };
    });
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    positions.forEach((p, i) => {
      p.angle += p.orbitSpeed * 0.01;
      const mesh = pointsRef.current.children[i];
      if (mesh) {
        mesh.position.x = Math.cos(p.angle) * p.orbitRadius;
        mesh.position.y = Math.sin(p.angle) * p.orbitRadius;
        mesh.position.z = p.z + Math.sin(t + i) * 0.2;
      }
    });
  });

  return (
    <group ref={pointsRef}>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function DistortedCore({ isAnalyzing, alertLevel }) {
  const meshRef = useRef();
  const coreColor = alertLevel > 70 ? '#FF3B3B' : alertLevel > 40 ? '#D4AF37' : '#00D1FF';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Pulse animation
    meshRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
    // Slow rotation
    meshRef.current.rotation.y += 0.005;
    meshRef.current.rotation.x += 0.003;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <MeshDistortMaterial
        color={coreColor}
        speed={isAnalyzing ? 5 : 2}
        distort={0.2}
        radius={1}
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

function ForensicCanvas({ isAnalyzing = false, alertLevel = 0 }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} color="#00D1FF" intensity={0.6} />
        <pointLight position={[-10, -10, 5]} color="#D4AF37" intensity={0.4} />
        <pointLight position={[0, 0, -10]} color="#D4AF37" intensity={0.2} />

        {/* Central Logo - custom 3D geometry */}
        <LogoPlane isAnalyzing={isAnalyzing} />

        {/* Subtle distorted core behind the logo */}
        <DistortedCore isAnalyzing={isAnalyzing} alertLevel={alertLevel} />

        {/* Multiple orbiting rings */}
        <OrbitingRing radius={2.2} speed={0.015} color="#D4AF37" emissiveIntensity={1.5} tilt={0.3} wireframe />
        <OrbitingRing radius={2.8} speed={-0.01} color="#00D1FF" emissiveIntensity={1.0} tilt={-0.5} wireframe />
        <OrbitingRing radius={3.5} speed={0.008} color="#D4AF37" emissiveIntensity={0.8} tilt={0.8} wireframe={false} />
        <OrbitingRing radius={1.6} speed={-0.02} color="#00D1FF" emissiveIntensity={2.0} tilt={0.1} wireframe />

        {/* Floating data points orbiting around the logo */}
        <FloatingDataPoints count={24} />

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.2} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default ForensicCanvas;
