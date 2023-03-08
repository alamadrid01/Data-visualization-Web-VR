import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated, config } from "@react-spring/three";

function Box({ position, geometry }) {
  const [active, setActive] = useState(false);
  const meshRef = useRef();
  const { scale } = useSpring({
    scale: active ? 1.5 : 1,
    config: config.wobbly,
  });

  useFrame(({ clock }) => {
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={() => setActive(!active)}
    >
      <boxGeometry args={geometry} />
      <meshBasicMaterial color="pink" />
    </animated.mesh>
  );
}

const Sphere = ({ position, geometry }) => {
  const sphereMeshRef = useRef();

  useFrame(({ clock }) => {
    sphereMeshRef.current.rotation.x += 0.01;
    sphereMeshRef.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={sphereMeshRef} position={position}>
      <sphereGeometry args={geometry} />
      <meshStandardMaterial />
    </mesh>
  );
};

const PlaneGeometry = ({ position }) => {
  const planeRef = useRef();

  return (
    <mesh ref={planeRef} rotation-x={-0.5 * Math.PI}>
      <planeGeometry color="red" args={[10, 10, 3]} />
      <meshStandardMaterial side={THREE.DoubleSide} />
    </mesh>
  );
};



function BarChart() {
  const controlsRef = useRef();
 
  return (
    <Canvas style={{ width: "50vw", height: "50vh" }}>
      <OrbitControls ref={controlsRef} />
      <axesHelper args={[5]} />
      <gridHelper args={[10]} />
      <ambientLight intensity={0.1} />
      <directionalLight color="gold" position={[0, 0, 5]} />
      <PlaneGeometry />
      <Box position={[0, 0, 0]} geometry={[1, 1, 1]} />
      <Box position={[-1, 1, 0]} geometry={[1, 1, 1]} />
      <Sphere position={[-2, 2, 0]} geometry={[1, 1, 1]} />
    </Canvas>
  );
}

export default BarChart;
