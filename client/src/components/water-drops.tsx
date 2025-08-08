import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// Import Minecraft textures
import farmlandTexture from '@assets/farmland_1754685272635.png';
import wetFarmlandTexture from '@assets/wet_farmland_1754685272635.png';
import carrotsStage0 from '@assets/carrots_stage0_1754685345998.png';
import largeFernTop from '@assets/large_fern_top_1754685345999.png';
import dandelion2 from '@assets/dandelion_2_1754685345999.png';
import oakSapling from '@assets/oak_sapling_1754685345999.png';
import grass from '@assets/grass_1754685346000.png';
import grass1 from '@assets/grass1_1754685346000.png';
import allium from '@assets/allium_1754685346000.png';

interface WaterParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  onSurface: boolean;
  surfaceTime: number;
  isDroplet: boolean;
  trail: { position: THREE.Vector3; opacity: number }[];
  splashParticles?: WaterParticle[];
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

  // Physics constants - Enhanced for dramatic effects
  const GRAVITY = new THREE.Vector3(0, -0.004, 0); // Stronger gravity
  const WIND = new THREE.Vector3(0.001 * (Math.random() - 0.5), 0, 0); // Stronger random wind
  const SURFACE_TENSION = 0.85;
  const PARTICLE_LIMIT = 180; // More particles for dramatic effect
  const SPLASH_PARTICLES = 12; // More particles per splash
  
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

  const checkCollisionWithUI = useCallback((particle: WaterParticle, scene: THREE.Scene): { collision: boolean; createSplash: boolean } => {
    const pos = particle.mesh.position;
    let createSplash = false;
    
    for (const boundary of boundariesRef.current) {
      if (pos.x >= boundary.left && pos.x <= boundary.right &&
          pos.y >= boundary.bottom && pos.y <= boundary.top) {
        
        // Create splash on impact with UI elements
        if (!particle.onSurface && particle.velocity.y < -0.002) {
          createSplash = true;
          // Create splash particles directly in collision detection
          for (let i = 0; i < SPLASH_PARTICLES; i++) {
            const angle = (Math.PI * 2 * i) / SPLASH_PARTICLES + Math.random() * 0.3;
            const speed = 0.002 + Math.random() * 0.004;
            
            const splashParticle = createParticle(
              pos.x + (Math.random() - 0.5) * 0.2,
              pos.y + Math.random() * 0.1,
              false, // splash particle
              new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed * 0.5 + 0.001, // Slight upward motion
                0
              )
            );
            
            scene.add(splashParticle.mesh);
            particlesRef.current.push(splashParticle);
          }
        }
        
        // Water flows off edges dramatically
        if (pos.x <= boundary.left + 0.8 || pos.x >= boundary.right - 0.8) {
          particle.velocity.x += (pos.x < (boundary.left + boundary.right) / 2) ? -0.003 : 0.003;
          particle.velocity.y *= 0.7; // Slow down vertical movement
        }
        
        // Pour down from bottom edge with more drama
        if (pos.y <= boundary.bottom + 0.5) {
          particle.velocity.y -= 0.004; // Faster pour
          particle.velocity.x += (Math.random() - 0.5) * 0.002; // More spread
          return { collision: false, createSplash }; // Let it continue falling
        }
        
        return { collision: true, createSplash }; // On surface
      }
    }
    return { collision: false, createSplash };
  }, []);

  const createParticle = useCallback((
    x?: number, 
    y?: number, 
    isDroplet: boolean = true,
    customVelocity?: THREE.Vector3
  ): WaterParticle => {
    const size = isDroplet ? (0.04 + Math.random() * 0.06) : (0.02 + Math.random() * 0.03); // Larger droplets
    const dropGeometry = new THREE.SphereGeometry(size, 8, 8);
    const dropMaterial = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.9, 0.75),
      transparent: true, 
      opacity: isDroplet ? 0.98 : 0.85 // Higher opacity for main droplets
    });

    const mesh = new THREE.Mesh(dropGeometry, dropMaterial);
    mesh.position.set(
      x ?? (Math.random() - 0.5) * 20, // Wider spawn area
      y ?? 12 + Math.random() * 4,
      (Math.random() - 0.5) * 3
    );

    const velocity = customVelocity || new THREE.Vector3(
      (Math.random() - 0.5) * 0.01, // Much more horizontal randomness for drama
      -0.005 - Math.random() * 0.008, // Faster, more varied falling speeds
      0
    );

    return {
      mesh,
      velocity,
      acceleration: new THREE.Vector3(0, 0, 0),
      life: 1.0,
      maxLife: isDroplet ? (12000 + Math.random() * 10000) : (3000 + Math.random() * 2000),
      size,
      onSurface: false,
      surfaceTime: 0,
      isDroplet,
      trail: [],
      splashParticles: undefined
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

    // Initialize particles - more on home page
    const particles: WaterParticle[] = [];
    const particleCount = window.location.pathname === '/' ? 80 : 40; // More water on home page
    for (let i = 0; i < particleCount; i++) {
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
        
        // Add turbulence near UI elements with splash detection
        const collisionResult = checkCollisionWithUI(particle, scene);
        const onUI = collisionResult.collision;
        
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

      // Much more frequent and random particle spawning on home page
      const spawnRate = window.location.pathname === '/' ? 0.08 : 0.03; // Double spawn rate
      if (Math.random() < spawnRate && particles.length < PARTICLE_LIMIT) {
        // Create burst spawning occasionally for dramatic effect
        const burstCount = Math.random() < 0.1 ? 3 + Math.floor(Math.random() * 3) : 1;
        
        for (let i = 0; i < burstCount && particles.length < PARTICLE_LIMIT; i++) {
          const newParticle = createParticle(
            (Math.random() - 0.5) * 22, // Wider spawn area
            12 + Math.random() * 5 // Higher spawn height
          );
          scene.add(newParticle.mesh);
          particles.push(newParticle);
        }
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
      className="pointer-events-none fixed inset-0"
      style={{ 
        zIndex: 9999, // Front of blur backgrounds for clear viewing
        mixBlendMode: window.location.pathname === '/' ? 'normal' : 'multiply',
        filter: window.location.pathname === '/' ? 'contrast(1.3) brightness(1.2) drop-shadow(0 0 4px rgba(135,206,235,0.8)) saturate(1.2)' : 'contrast(1.1) brightness(0.9)',
        opacity: window.location.pathname === '/' ? 1 : 0.85
      }}
    />
  );
}

// Minecraft Wet Farmland Footer Component
export function MinecraftFarmlandFooter() {
  const plantImages = [
    carrotsStage0,
    largeFernTop, 
    dandelion2,
    oakSapling,
    grass,
    grass1,
    allium
  ];

  return (
    <footer className="relative w-full h-32 overflow-hidden border-t-4 border-amber-600">
      {/* Base farmland texture */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${farmlandTexture}')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px', // Doubled size for better detail visibility
          imageRendering: 'pixelated'
        }}
      />
      
      {/* Wet farmland overlay for water absorption areas */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={`wet-${i}`}
            className="absolute animate-pulse opacity-70"
            style={{
              backgroundImage: `url('${wetFarmlandTexture}')`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: '128px 128px',
              imageRendering: 'pixelated',
              width: '128px',
              height: '128px',
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 50}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Growing plants scattered across the footer */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => {
          const plantImage = plantImages[Math.floor(Math.random() * plantImages.length)];
          const scale = 1.2 + Math.random() * 0.8; // Larger plants: Random scale 1.2-2.0
          
          return (
            <div
              key={`plant-${i}`}
              className="absolute animate-bounce"
              style={{
                backgroundImage: `url('${plantImage}')`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                imageRendering: 'pixelated',
                width: `${32 * scale}px`,
                height: `${32 * scale}px`,
                left: `${5 + Math.random() * 85}%`,
                top: `${10 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${4 + Math.random() * 3}s`,
                transform: `scale(${scale})`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            />
          );
        })}
      </div>

      {/* Footer content */}
      <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/10">
        <div className="text-center text-amber-100 drop-shadow-lg">
          <p className="text-sm font-medium mb-1 text-shadow">Growth happens here</p>
          <p className="text-xs text-amber-200/90">Water nourishes the Bonemeal ecosystem</p>
        </div>
      </div>
    </footer>
  );
}