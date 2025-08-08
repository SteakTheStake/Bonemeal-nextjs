import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface WaterDropsProps {
  className?: string;
}

export function WaterDrops({ className = '' }: WaterDropsProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(200, 300);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Water drop geometry and material
    const dropGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const dropMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x87ceeb, 
      transparent: true, 
      opacity: 0.7 
    });

    // Create multiple water drops
    const drops: Array<{ mesh: THREE.Mesh; speed: number; phase: number }> = [];
    
    for (let i = 0; i < 12; i++) {
      const drop = new THREE.Mesh(dropGeometry, dropMaterial);
      drop.position.x = (Math.random() - 0.5) * 3;
      drop.position.y = 3 + Math.random() * 2;
      drop.position.z = (Math.random() - 0.5) * 2;
      
      scene.add(drop);
      drops.push({
        mesh: drop,
        speed: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2
      });
    }

    camera.position.z = 3;

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Animate drops falling
      drops.forEach((dropData, index) => {
        const { mesh, speed, phase } = dropData;
        
        // Fall down
        mesh.position.y -= speed;
        
        // Add slight wave motion
        mesh.position.x += Math.sin(Date.now() * 0.001 + phase) * 0.001;
        
        // Reset position when drop reaches bottom
        if (mesh.position.y < -3) {
          mesh.position.y = 3 + Math.random() * 2;
          mesh.position.x = (Math.random() - 0.5) * 3;
        }

        // Fade in/out based on position
        const opacity = Math.max(0, Math.min(0.7, (mesh.position.y + 3) / 6));
        if (mesh.material instanceof THREE.MeshBasicMaterial) {
          mesh.material.opacity = opacity;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`pointer-events-none fixed top-0 left-0 z-0 ${className}`}
      style={{ 
        width: '200px', 
        height: '300px',
        mixBlendMode: 'multiply'
      }}
    />
  );
}

interface WaterDropOverlayProps {
  className?: string;
}

export function WaterDropOverlay({ className = '' }: WaterDropOverlayProps) {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {/* Corner drops */}
      <WaterDrops className="top-0 left-0" />
      <WaterDrops className="top-0 right-0" />
      <WaterDrops className="bottom-0 left-20" />
      <WaterDrops className="bottom-0 right-20" />
      
      {/* Center drops for larger screens */}
      <div className="hidden lg:block">
        <WaterDrops className="top-1/4 left-1/4" />
        <WaterDrops className="top-1/3 right-1/3" />
      </div>
    </div>
  );
}