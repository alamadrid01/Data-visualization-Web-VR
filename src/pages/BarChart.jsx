import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated, config } from "@react-spring/three";
import * as d3 from "d3";
import axios from "axios";
import {toast, ToastContainer} from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';


const PlaneGeometry = ({ position }) => {
  const planeRef = useRef();

  return (
    <mesh ref={planeRef} rotation-x={-0.5 * Math.PI} position-z={1}>
      <planeGeometry color="red" args={[30, 30, 1]} />
      <meshStandardMaterial side={THREE.DoubleSide} />
    </mesh>
  );
};


const MappedVariable = ({data, zPos, color, scale}) => {
  const groupRef = useRef();
  const mesh = useRef();

  const yMax = d3.max(scale.openPrice);
  const dataSCale = d3.scaleLinear().domain([0, yMax]).range([-0, 50]);
  const yBase = dataSCale(yMax / 200);

   const [activeList, setActiveList] = useState(
    Array(data.length).fill(false)
  );


  return(
    <group ref={groupRef}>
    {data.openPrice.map((d, i) => (
      <mesh
        key={i}
        ref={mesh}
        onClick={() => {
          const newList = [...activeList];
          newList[i] = !newList[i];
          setActiveList(newList);
          toast.success(`Symbol: ${data.symbol}, On ${data.dates[i]}, The High Price is ${data.highPrice[i]}, The Low Price is ${data.lowPrice[i]} The Volume is ${data.volume[i]}`);
        }}
        position={[i * 1.2 - 8, yBase * dataSCale(d), (zPos)]}
        scale={[0.25, 1, 0.25]}
      >
        <boxGeometry args={[2, dataSCale(d / 2), 2.5]} />
        <animated.meshStandardMaterial
          color={color}
          opacity={activeList[i] ? 0.6 : 1}
          transparent
          
        />
      </mesh>
    ))}
  </group>
  )
}

function AxisLabels({data}) {

  const tick = d3.scaleBand().domain(data.dates).range([0, 18]).padding(0.000009);

  return (
    <>
  <group>
    {data.dates.map((label, index) => (
      <Text
        key={index}
        color="purple"
        fontSize={0.5}
        position={[tick(label) - 8.5, 0.3, 10]}
        anchorX="center"
        anchorY="middle"
        rotation={[Math.PI * -0.05,  Math.PI * -0.5, Math.PI / 200]}
      >
        {label}
      </Text>
    ))}
  </group>
    </>
  )
}


const XAxis = ({ticks, tickPositions, tickLabels, labelPosition}) => {
  const mesh = useRef()

  return (
    <group ref={mesh}>
      {ticks.map((tick, i) => (
        <line
          key={tick}
          position={[tickPositions[i][0], tickPositions[i][1], 0]}
          points={[
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -0.5),
          ]}
        />
      ))}
      {tickLabels.map((label, i) => (
        <Text
          key={i}
          color={'red'}
          anchorX="center"
          anchorY="top"
          fontSize={0.4}
          position={[tickPositions[i][0], tickPositions[i][1] - 0.6, 0]}
        >
          {label}
        </Text>
      ))}
      <Text
        color={'red'}
        anchorX="center"
        anchorY="top"
        fontSize={0.4}
        position={[labelPosition[0], labelPosition[1], labelPosition[2]]}
      >
        X-Axis Label
      </Text>
    </group>
  )
}


function BarChart() {
  const controlsRef = useRef();

  const [data, setData] = useState([]);
  const [GoogleData, setGoogleData] = useState([]);
  const [TeslaData, setTeslaData] = useState([]);
  const [MicrosoftData, setMicrosoftData] = useState([]);
  const [AppleData, setAppleData] = useState([]);
  const [TwitterData, setTwitterData] = useState([]);
  const [loading, setLoading] = useState(true);
  

  

  const endpoint = [
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=AAPL&apikey=FSLZGW7CI7N7Z555",
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=GOOGL&apikey=FSLZGW7CI7N7Z555",
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=TSLA&apikey=FSLZGW7CI7N7Z555",
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=MSFT&apikey=FSLZGW7CI7N7Z555",
    "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=TWTR&apikey=FSLZGW7CI7N7Z555",
  ];

  useEffect(() => {
    const cachedData = localStorage.getItem("technologyData");
    if (cachedData) {
      const result = JSON.parse(cachedData);
      setLoading(false);


      if (result[0]) {
        const first = result[0];
        const metaData = first["Meta Data"]
        const newArray = Object.values(metaData)
        const symbol = newArray[1]

        const monthlyAdjustedTimeSeries =
          first["Monthly Adjusted Time Series"];

        const dates = Object.keys(monthlyAdjustedTimeSeries);

        const openPrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) =>{
            return parseFloat(item["1. open"])
          }
        );
        const highPrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["2. high"])
        );
        const lowPrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["3. low"])
        );
        const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["4. close"])
        );
        const volumes = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["6. volume"])
        );
        setAppleData({openPrice: openPrices.slice(0, 15),lowPrice: lowPrices.slice(0, 15), highPrice: highPrices.slice(0, 15), closePrice: closePrices.slice(0, 15), volume: volumes.slice(0, 15), dates: dates.slice(0, 15), symbol});
      }

      if (result[1]) {
        const second = result[1];
        const metaData = second["Meta Data"]
        const newArray = Object.values(metaData)
        const symbol = newArray[1]

        // const symbol = Object.values(metaData).map(item => console.log(item["2. Symbol"]))
        const monthlyAdjustedTimeSeries = second["Monthly Adjusted Time Series"];

        const dates = Object.keys(monthlyAdjustedTimeSeries);
         const openPrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["1. open"])
        );
        const highPrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["2. high"])
        );
        const lowPrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["3. low"])
        );
        const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["4. close"])
        );
        const volumes = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["6. volume"])
        );
        setGoogleData({openPrice: openPrices.slice(0, 15),lowPrice: lowPrices.slice(0, 15), highPrice: highPrices.slice(0, 15), closePrice: closePrices.slice(0, 15), volume: volumes.slice(0, 15), dates: dates.slice(0, 15), symbol});
      }

      if (result[2]) {
        const third = result[2];
        const metaData = third["Meta Data"]
        const newArray = Object.values(metaData)
        const symbol = newArray[1]

        const monthlyAdjustedTimeSeries =
          third["Monthly Adjusted Time Series"];

          const dates = Object.keys(monthlyAdjustedTimeSeries);
          const openPrices = Object.values(monthlyAdjustedTimeSeries).map(
            (item) => parseFloat(item["1. open"])
          );
          const highPrices = Object.values(monthlyAdjustedTimeSeries).map(
            (item) => parseFloat(item["2. high"])
          );
          const lowPrices = Object.values(monthlyAdjustedTimeSeries).map(
            (item) => parseFloat(item["3. low"])
          );
          const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
            (item) => parseFloat(item["4. close"])
          );
          const volumes = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["6. volume"])
        );
          setTeslaData({openPrice: openPrices.slice(0, 15),lowPrice: lowPrices.slice(0, 15), highPrice: highPrices.slice(0, 15), closePrice: closePrices.slice(0, 15), volume: volumes.slice(0, 15), dates: dates.slice(0, 15), symbol});
      }

      if (result[3]) {
        const fourth = result[3];
        const metaData = fourth["Meta Data"]
        const newArray = Object.values(metaData)
        const symbol = newArray[1]


        const monthlyAdjustedTimeSeries = fourth["Monthly Adjusted Time Series"];

        const dates = Object.keys(monthlyAdjustedTimeSeries);
          const openPrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["1. open"])
        );
        const highPrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["2. high"])
        );
        const lowPrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["3. low"])
        );
        const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["4. close"])
        );
        const volumes = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["6. volume"])
        );
        setMicrosoftData({openPrice: openPrices.slice(0, 15),lowPrice: lowPrices.slice(0, 15), highPrice: highPrices.slice(0, 15), closePrice: closePrices.slice(0, 15), volume: volumes.slice(0, 15), dates: dates.slice(0, 15), symbol});
      }
      if (result[4]) {
        const fifth = result[4];
        const metaData = fifth["Meta Data"]
        const newArray = Object.values(metaData)
        const symbol = newArray[1]

        const monthlyAdjustedTimeSeries = fifth["Monthly Adjusted Time Series"];

        const dates = Object.keys(monthlyAdjustedTimeSeries);
        const openPrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["1. open"])
        );
        const highPrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["2. high"])
        );
        const lowPrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["3. low"])
        );
        const closePrices = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["4. close"])
        );
        const volumes = Object.values(monthlyAdjustedTimeSeries).map(
          (item) => parseFloat(item["6. volume"])
        );
        setTwitterData({openPrice: openPrices.slice(0, 15),lowPrice: lowPrices.slice(0, 15), highPrice: highPrices.slice(0, 15), closePrice: closePrices.slice(0, 15), volume: volumes.slice(0, 15), dates: dates.slice(0, 15), symbol});
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


  return (
    <>
    <ToastContainer />
      <Canvas style={{ width: "50vw", height: "50vh" }}>
        <OrbitControls ref={controlsRef} />
        <axesHelper args={[11, 20]} scale={[1.6, 1, 1]} position={[-8.5, 0 , -3]}/>
        <gridHelper args={[18]} />
        <AxisLabels data={GoogleData}/>
        <ambientLight intensity={0.1} />
        <directionalLight color="gold" position={[0, 0, 5]} />
     
        <PlaneGeometry />
        <MappedVariable data={MicrosoftData} zPos={5} color={"red"} scale={GoogleData}/>
        <MappedVariable data={AppleData} zPos={6.5} color={"green"} scale={GoogleData}/>
        <MappedVariable data={TeslaData} zPos={-0.5} color={"magenta"} scale={GoogleData}/>
        <MappedVariable data={GoogleData} zPos={-2} color={"blue"} scale={GoogleData}/>
        <MappedVariable data={TwitterData} zPos={2} color={"orange"} scale={GoogleData}/>
      </Canvas>
    </>
  );
}

export default BarChart;
