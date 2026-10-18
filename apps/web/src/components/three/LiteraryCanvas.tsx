import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

export const LiteraryCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { lowEffects, theme } = useTheme();

  useEffect(() => {
    if (lowEffects || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 25;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch {
      return; // Graceful WebGL fallback
    }

    // Floating Stardust Particles (Representing words & poetic memories)
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const violetColor = new THREE.Color(theme === 'dark' ? 0x8b7cf6 : 0x7c3aed);
    const roseColor = new THREE.Color(theme === 'dark' ? 0xf43f5e : 0xe11d48);
    const ivoryColor = new THREE.Color(theme === 'dark' ? 0xfaf8f5 : 0xb5a78c);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const mixed = Math.random();
      const color = mixed < 0.4 ? violetColor : mixed < 0.7 ? roseColor : ivoryColor;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: theme === 'dark' ? 0.75 : 0.45,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Subtle 3D Geometric Ring (The Celestial Ring of Poetry)
    const ringGeo = new THREE.TorusGeometry(8, 0.08, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0x8b7cf6 : 0x7c3aed,
      transparent: true,
      opacity: theme === 'dark' ? 0.25 : 0.15,
      wireframe: true,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 4;
    scene.add(ring);

    // Mouse Interaction for parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle rotation
      particles.rotation.y = elapsedTime * 0.04 + mouseX * 0.2;
      particles.rotation.x = Math.sin(elapsedTime * 0.03) * 0.1 + mouseY * 0.15;

      ring.rotation.z = elapsedTime * 0.08;
      ring.rotation.y = elapsedTime * 0.05 + mouseX * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [lowEffects, theme]);

  if (lowEffects) {
    // Beautiful subtle gradient fallback for reduced-motion and low-end devices
    return (
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-charcoal-900/30 via-transparent to-charcoal-950/60" />
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-80"
      aria-hidden="true"
    />
  );
};

