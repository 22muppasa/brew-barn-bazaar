
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PresentationControls } from "@react-three/drei";
import { CoffeeBean3D } from "./CoffeeBean3D";

interface Scene3DProps {
  className?: string;
}

const Scene3D = ({ className }: Scene3DProps) => {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        <Suspense fallback={null}>
          <PresentationControls
            global
            rotation={[0, -Math.PI / 4, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
          >
            <CoffeeBean3D position={[0, 0, 0]} />
          </PresentationControls>
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={1}
          maxPolarAngle={Math.PI / 2} 
          minPolarAngle={Math.PI / 3} 
        />
      </Canvas>
    </div>
  );
};

export default Scene3D;
