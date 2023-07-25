import React from "react";
import Webcam from "react-webcam";
import cv from "@techstark/opencv-js";
import { loadHaarFaceModels, detectHaarFace } from "./haarFaceDetection";
import "./styles.css";

export default function App() {
  const [modelLoaded, setModelLoaded] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  const canvas = document.querySelector("canvas");
  let pct = 0;
  let count =0, faceCheck, counttotal = 0;

  React.useEffect(() => {
    loadHaarFaceModels().then(() => {
      setModelLoaded(true);
    });
  }, []);

  const webcamRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const faceImgRef = React.useRef(null);

  React.useEffect(() => {
    if (!modelLoaded) return;

    const detectFace = async () => {
      if (!isActive){
        canvas.style.display = "none";
        return;
      }

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      return new Promise((resolve) => {
        imgRef.current.src = imageSrc;
        imgRef.current.onload = () => {
          try {
            const img = cv.imread(imgRef.current);
            faceCheck = detectHaarFace(img);
            if (faceCheck === true){
              count = count + 1;
            }
            counttotal = counttotal + 1;
            cv.imshow(faceImgRef.current, img);

            img.delete();
            resolve();
          } catch (error) {
            console.log(error);
            resolve();
          }
        };
      });
    };

    let handle;
    const nextTick = () => {
      handle = setInterval(async () => {
        await detectFace();
      }, 1000/24);
    };
    nextTick();
    const detectionStopTimeout = setTimeout(() => {
      setIsActive(false);
    }, 18000); // 180 seconds (3 minutes)

    return () => {
      clearInterval(handle);
      clearTimeout(detectionStopTimeout);
      pct = (count/counttotal)*100;;
      console.log(pct)
    };

    
  }, [isActive]);

  const handleStartFaceDetection = () => {
    setIsActive(true);
    canvas.style.display = "block";
  };

  return (
    <div className="App">
      <Webcam
        ref={webcamRef}
        className="webcam"
        mirrored
        screenshotFormat="image/jpeg"
        audio={false}
      />
      <img className="inputImage" alt="input" ref={imgRef} />
      <canvas className="outputImage" ref={faceImgRef} />
      {!modelLoaded && <div>Loading Haar-cascade face model...</div>}
      {!isActive && modelLoaded && (
        <button onClick={handleStartFaceDetection}>Start Face Detection</button>
      )}
    </div>
  );
}
