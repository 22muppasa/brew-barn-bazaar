
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";

// This is a placeholder since we don't have the actual 3D model file
// You'll need to replace this with the actual path to your GLTF/GLB file
const MODEL_PATH = "/path-to-your-model.glb";

export function CoffeeBean3D(props: any) {
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Note: This is a placeholder. You'll need to upload your 3D model file
  // and update the path above. If you get errors, we can create a simple
  // 3D bean shape instead of loading a model.
  const { nodes, materials } = useGLTF(MODEL_PATH) as any;
  
  // Animate the coffee bean rotation
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group 
      ref={group} 
      {...props}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* This is a placeholder. Once you have your model, you'll replace this
          with the actual mesh references from your loaded model */}
      <mesh>
        <capsuleGeometry args={[0.5, 1, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#8B4513" : "#654321"} 
          roughness={0.7} 
          metalness={0.2} 
        />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
