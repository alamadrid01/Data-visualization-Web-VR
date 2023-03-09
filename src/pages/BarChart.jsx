import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated, config } from "@react-spring/three";
import * as d3 from "d3";
import axios from "axios";

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
      <planeGeometry color="red" args={[12, 12, 3]} />
      <meshStandardMaterial side={THREE.DoubleSide} />
    </mesh>
  );
};


const MappedVariable = ({data, zPos, color}) => {

  const [active, setActive] = useState(false);
  const groupRef = useRef();

  const yMax = d3.max(data);
  const dataSCale = d3.scaleLinear().domain([0, yMax]).range([0, 3]);
  const yBase = dataSCale(yMax / 2 + 2);

  const [activeList, setActiveList] = useState(
    Array(data.length).fill(false)
  );

  return(
    <group ref={groupRef}>
    {data.map((d, i) => (
      <mesh
        key={i}
        onClick={() => {
          const newList = [...activeList];
          newList[i] = !newList[i];
          setActiveList(newList);
        }}
        position={[i * 1.2 - 5.5, yBase + dataSCale(i), (zPos)]}
        scale={[0.25, dataSCale(d / 2), 0.25]}
      >
        <boxGeometry args={[2, dataSCale(d), 2.5]} />
        <animated.meshStandardMaterial
          color={color}
          opacity={activeList[i] ? 0.5 : 1}
          transparent
        />
      </mesh>
    ))}
  </group>
  )
}

function BarChart() {
  const controlsRef = useRef();

  const [data, setData] = useState([]);
  const [IBMdata, setIBMData] = useState([]);
  const [GoogleData, setGoogleData] = useState([]);
  const [TeslaData, setTeslaData] = useState([]);
  const [MicrosoftData, setMicrosoftData] = useState([]);
  const [AppleData, setAppleData] = useState([]);
  const [loading, setLoading] = useState(true);

  

  const endpoint = [
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=IBM&apikey=FSLZGW7CI7N7Z555",
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=AAPL&apikey=FSLZGW7CI7N7Z555",
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=GOOGL&apikey=FSLZGW7CI7N7Z555",
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=TSLA&apikey=FSLZGW7CI7N7Z555",
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=MSFT&apikey=FSLZGW7CI7N7Z555",
  ];

  useEffect(() => {
    const cachedData = localStorage.getItem("technologyData");
    if (cachedData) {
      const result = JSON.parse(cachedData);
      setLoading(false);

      if (result[0]) {
        const first = result[0];
        const monthlyAdjustedTimeSeries = first["Monthly Adjusted Time Series"];
        const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["4. close"])
        );
        setIBMData(closePrices.slice(0, 10));
      }

      if (result[1]) {
        const second = result[1];
        const monthlyAdjustedTimeSeries =
          second["Monthly Adjusted Time Series"];
        const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["4. close"])
        );
        setAppleData(closePrices.slice(0, 10));
      }

      if (result[2]) {
        const third = result[2];
        const monthlyAdjustedTimeSeries = third["Monthly Adjusted Time Series"];
        const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["4. close"])
        );
        setGoogleData(closePrices.slice(0, 10));
      }

      if (result[3]) {
        const fourth = result[3];
        const monthlyAdjustedTimeSeries =
          fourth["Monthly Adjusted Time Series"];
        const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["4. close"])
        );
        setTeslaData(closePrices.slice(0, 10));
      }

      if (result[4]) {
        const fifth = result[4];
        const monthlyAdjustedTimeSeries = fifth["Monthly Adjusted Time Series"];
        const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["4. close"])
        );
        setMicrosoftData(closePrices.slice(0, 10));
      }
    } else {
      const fetchData = async () => {
        try {
          const allData = await Promise.all(
            endpoint.map((end) => axios.get(end))
          );
          const result = allData.map((response) => response.data);
          localStorage.setItem("technologyData", JSON.stringify(result));
          setData(result);
          console.log("newly fetched", result);
          setLoading(false);
        } catch (err) {
          console.error(err.message);
        }
      };
      fetchData();
    }
  }, []);


  //   console.log("IBM", IBMdata);
  //   console.log("AppleData", AppleData);
  //   console.log("GoogleData", GoogleData);
  //   console.log("TeslaData", TeslaData);
  //   console.log("MicrosoftData", MicrosoftData);

  return (
    <>
      <Canvas style={{ width: "50vw", height: "50vh" }}>
        <OrbitControls ref={controlsRef} />
        <axesHelper args={[10]} />
        <gridHelper args={[15]} />
        <ambientLight intensity={0.1} />
        <directionalLight color="gold" position={[0, 0, 5]} />
     
        <PlaneGeometry />
        {/* <Box position={[0, 0, 0]} geometry={[1, 1, 1]} />
        <Box position={[-1, 1, 0]} geometry={[1, 1, 1]} /> */}
        {/* <Sphere position={[-2, 2, 0]} geometry={[1, 1, 1]} /> */}
        <MappedVariable data={MicrosoftData} zPos={5} color={"red"} />
        <MappedVariable data={IBMdata} zPos={3.5} color={"yellow"} />
        <MappedVariable data={AppleData} zPos={2} color={"green"} />
        <MappedVariable data={GoogleData} zPos={0.5} color={"blue"} />
        <MappedVariable data={TeslaData} zPos={-1} color={"magenta"} />
      </Canvas>
    </>
  );
}

export default BarChart;
