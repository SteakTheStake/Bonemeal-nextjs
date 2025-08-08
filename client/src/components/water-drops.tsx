import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

interface WaterParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  onSurface: boolean;
  surfaceTime: number;
}

interface UIBoundary {
  top: number;
  bottom: number;
  left: number;
  right: number;
  element: Element;
}

export function PhysicsWaterSystem() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const particlesRef = useRef<WaterParticle[]>([]);
  const boundariesRef = useRef<UIBoundary[]>([]);

  // Physics constants
  const GRAVITY = new THREE.Vector3(0, -0.0012, 0);
  const WIND = new THREE.Vector3(0.0001, 0, 0);
  const SURFACE_TENSION = 0.95;
  const PARTICLE_LIMIT = 80; // Performance limit
  
  const updateUIBoundaries = useCallback(() => {
    const boundaries: UIBoundary[] = [];
    
    // Find UI components that water should flow off
    const uiElements = document.querySelectorAll(
      '.card, .bg-card, .border, .rounded-lg, .navbar, .header, .sidebar, .panel, .button, .input'
    );
    
    uiElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 50 && rect.height > 30) { // Skip tiny elements
        boundaries.push({
          top: rect.top / window.innerHeight * 20 - 10, // Convert to 3D space
          bottom: rect.bottom / window.innerHeight * 20 - 10,
          left: rect.left / window.innerWidth * 20 - 10,
          right: rect.right / window.innerWidth * 20 - 10,
          element
        });
      }
    });
    
    boundariesRef.current = boundaries;
  }, []);

  const checkCollisionWithUI = useCallback((particle: WaterParticle): boolean => {
    const pos = particle.mesh.position;
    
    for (const boundary of boundariesRef.current) {
      if (pos.x >= boundary.left && pos.x <= boundary.right &&
          pos.y >= boundary.bottom && pos.y <= boundary.top) {
        
        // Water flows off edges
        if (pos.x <= boundary.left + 0.5 || pos.x >= boundary.right - 0.5) {
          particle.velocity.x += (pos.x < (boundary.left + boundary.right) / 2) ? -0.001 : 0.001;
        }
        
        // Flow down from bottom edge
        if (pos.y <= boundary.bottom + 0.3) {
          particle.velocity.y -= 0.002;
          particle.velocity.x += (Math.random() - 0.5) * 0.0005; // Slight spread
          return false; // Let it continue falling
        }
        
        return true; // On surface
      }
    }
    return false;
  }, []);

  const createParticle = useCallback((x?: number, y?: number): WaterParticle => {
    const dropGeometry = new THREE.SphereGeometry(0.02 + Math.random() * 0.03, 6, 6);
    const dropMaterial = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.7, 0.6),
      transparent: true, 
      opacity: 0.8
    });

    const mesh = new THREE.Mesh(dropGeometry, dropMaterial);
    mesh.position.set(
      x ?? (Math.random() - 0.5) * 18,
      y ?? 12 + Math.random() * 3,
      (Math.random() - 0.5) * 2
    );

    return {
      mesh,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.002,
        -0.001 - Math.random() * 0.003,
        0
      ),
      acceleration: new THREE.Vector3(0, 0, 0),
      life: 1.0,
      maxLife: 8000 + Math.random() * 5000,
      size: 0.02 + Math.random() * 0.03,
      onSurface: false,
      surfaceTime: 0
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: false, // Performance optimization
      powerPreference: "low-power"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    camera.position.z = 5;

    // Initialize particles
    const particles: WaterParticle[] = [];
    for (let i = 0; i < 40; i++) {
      const particle = createParticle();
      scene.add(particle.mesh);
      particles.push(particle);
    }
    particlesRef.current = particles;

    // Update UI boundaries initially and on resize
    updateUIBoundaries();
    const resizeHandler = () => {
      updateUIBoundaries();
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.left = -window.innerWidth / window.innerHeight * 10;
      camera.right = window.innerWidth / window.innerHeight * 10;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', resizeHandler);

    // Periodic boundary updates for dynamic content
    const boundaryUpdateInterval = setInterval(updateUIBoundaries, 2000);

    let lastTime = performance.now();
    let frameCount = 0;
    
    // Animation loop with performance monitoring
    const animate = (currentTime: number) => {
      frameRef.current = requestAnimationFrame(animate);
      
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      frameCount++;
      
      // Skip frames if performance is poor
      if (deltaTime > 32 && frameCount % 2 === 0) return;

      const particles = particlesRef.current;
      
      // Physics simulation
      particles.forEach((particle, index) => {
        if (particle.life <= 0) return;

        // Apply forces
        particle.acceleration.copy(GRAVITY);
        particle.acceleration.add(WIND);
        
        // Add turbulence near UI elements
        const onUI = checkCollisionWithUI(particle);
        
        if (onUI) {
          particle.onSurface = true;
          particle.surfaceTime += deltaTime;
          
          // Surface tension and evaporation
          particle.velocity.multiplyScalar(SURFACE_TENSION);
          particle.life -= deltaTime * 0.0003;
          
          // Merge nearby particles (performance optimization)
          if (particle.surfaceTime > 2000) {
            particle.life -= deltaTime * 0.001;
          }
        } else {
          particle.onSurface = false;
          particle.surfaceTime = 0;
        }

        // Update velocity and position
        particle.velocity.add(particle.acceleration);
        particle.mesh.position.add(particle.velocity);

        // Water reaches farmland (bottom of screen)
        if (particle.mesh.position.y < -12) {
          // Trigger absorption into farmland
          particle.life = 0;
        }

        // Update visual properties
        const material = particle.mesh.material as THREE.MeshBasicMaterial;
        material.opacity = Math.max(0, particle.life * 0.8);
        
        // Scale based on surface time for pooling effect
        if (particle.onSurface && particle.surfaceTime > 1000) {
          const scale = 1 + (particle.surfaceTime - 1000) * 0.0001;
          particle.mesh.scale.setScalar(Math.min(scale, 2));
        }

        // Remove dead particles
        if (particle.life <= 0 || material.opacity <= 0.01) {
          scene.remove(particle.mesh);
          particle.mesh.geometry.dispose();
          if (material instanceof THREE.Material) material.dispose();
          
          // Create new particle to maintain count
          if (particles.length < PARTICLE_LIMIT) {
            const newParticle = createParticle();
            scene.add(newParticle.mesh);
            particles[index] = newParticle;
          }
        }
      });

      // Occasional new particles from various spawn points
      if (Math.random() < 0.02 && particles.length < PARTICLE_LIMIT) {
        const newParticle = createParticle();
        scene.add(newParticle.mesh);
        particles.push(newParticle);
      }

      renderer.render(scene, camera);
    };

    animate(performance.now());

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', resizeHandler);
      clearInterval(boundaryUpdateInterval);
      
      particlesRef.current.forEach(particle => {
        scene.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        if (particle.mesh.material instanceof THREE.Material) {
          particle.mesh.material.dispose();
        }
      });
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [createParticle, updateUIBoundaries, checkCollisionWithUI]);

  return (
    <div 
      ref={mountRef} 
      className="pointer-events-none fixed inset-0 z-10"
      style={{ 
        mixBlendMode: 'multiply',
        filter: 'contrast(1.1) brightness(0.9)'
      }}
    />
  );
}

// Minecraft Wet Farmland Footer Component
export function MinecraftFarmlandFooter() {
  return (
    <footer className="relative w-full h-32 bg-gradient-to-t from-amber-900 via-amber-800 to-amber-700 overflow-hidden border-t-4 border-amber-600">
      {/* Wet farmland texture pattern */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(101, 67, 33, 0.8) 2px, transparent 2px),
            radial-gradient(circle at 80% 70%, rgba(101, 67, 33, 0.8) 1px, transparent 1px),
            linear-gradient(45deg, rgba(92, 64, 35, 0.3) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(92, 64, 35, 0.3) 25%, transparent 25%)
          `,
          backgroundSize: '8px 8px, 6px 6px, 4px 4px, 4px 4px',
          backgroundPosition: '0 0, 0 0, 0 0, 2px 2px'
        }}
      />
      
      {/* Water absorption areas */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-900/20 animate-pulse"
            style={{
              width: `${8 + Math.random() * 16}px`,
              height: `${4 + Math.random() * 8}px`,
              left: `${Math.random() * 90}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Minecraft crop sprites */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: '10%',
              width: '16px',
              height: '24px'
            }}
          >
            {/* Wheat crop sprite made with CSS */}
            <div className="relative w-full h-full">
              <div className="absolute bottom-0 w-2 h-3 bg-green-600 left-1/2 transform -translate-x-1/2" />
              <div className="absolute bottom-2 w-3 h-2 bg-green-500 left-1/2 transform -translate-x-1/2" />
              <div className="absolute bottom-3 w-4 h-3 bg-yellow-400 left-1/2 transform -translate-x-1/2 rounded-t" />
              <div className="absolute top-0 w-1 h-2 bg-green-400 left-1/2 transform -translate-x-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* Soil texture details */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 via-transparent to-amber-900/10" />
      
      {/* Growth particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full animate-bounce"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + Math.random() * 40}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      {/* Footer content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-amber-200/80">
          <p className="text-sm font-medium mb-1">🌱 Growth happens here</p>
          <p className="text-xs">Water nourishes the Bonemeal ecosystem</p>
        </div>
      </div>
    </footer>
  );
}