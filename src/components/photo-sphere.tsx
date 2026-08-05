import { useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import sphere1 from "@/assets/sphere-1.jpg";
import sphere2 from "@/assets/sphere-2.jpg";
import sphere3 from "@/assets/sphere-3.jpg";
import sphere4 from "@/assets/sphere-4.jpg";

/**
 * Swap these imports for your own photos (square crops look best).
 * Any number of images works — tiles are distributed evenly over the sphere.
 */
const IMAGES = [sphere1, sphere2, sphere3, sphere4];

const RADIUS = 2.35;
const TILE_COUNT = 32;

function fibonacciSphere(count: number, radius: number) {
  const points: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius));
  }
  return points;
}

function PhotoTiles() {
  const group = useRef<THREE.Group>(null);
  const textures = useLoader(THREE.TextureLoader, IMAGES);

  const points = useMemo(() => fibonacciSphere(TILE_COUNT, RADIUS), []);

  useMemo(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
    });
  }, [textures]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[RADIUS * 0.94, 48, 48]} />
        <meshStandardMaterial color="#0d0d11" roughness={0.35} metalness={0.6} />
      </mesh>

      {points.map((position, index) => {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          position.clone().normalize(),
        );
        return (
          <mesh key={index} position={position} quaternion={quaternion}>
            <planeGeometry args={[0.98, 0.98]} />
            <meshStandardMaterial
              map={textures[index % textures.length] ?? null}
              side={THREE.DoubleSide}
              roughness={0.4}
              metalness={0.15}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function PhotoSphere() {
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      aria-label="Rotating three-dimensional photo sphere"
      role="img"
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 6]} intensity={2.1} color="#ffd9a0" />
      <directionalLight position={[-6, -3, -4]} intensity={1.1} color="#b18cff" />
      <PhotoTiles />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.6}
        rotateSpeed={0.55}
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
