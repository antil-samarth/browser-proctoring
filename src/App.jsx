import React, { useState, useRef, useEffect } from "react";
import cv from "@techstark/opencv-js";
import { loadHaarFaceModels, detectHaarFace } from "./haarFaceDetection";
import "./styles.css";
import WebcamView from "./components/WebcamView";

const DetectionControls = ({ modelLoaded, isActive, onStart, onStop, detectionPercentage, isTestRunning }) => (
  <div className="controls">
    {!modelLoaded && <div>Loading ...</div>}
    {modelLoaded && !isActive && (
      <button onClick={onStart} disabled={isTestRunning}>Start Test</button>
    )}
    {isActive && (
      <button onClick={onStop}>Stop Test</button>
    )}
    {isTestRunning && (
      <div className="test-progress">
        Test in progress.
      </div>
    )}
  </div>
);

const DetectionInfo = ({ isFaceCurrentlyDetected, areMultipleFacesDetected, detectionPercentage }) => (
  <div className="detection-info">
    <p>Face Detected: {isFaceCurrentlyDetected ? "Yes" : "No"}</p>
    {areMultipleFacesDetected && (
      <p className="warning">Multiple faces detected!</p>
    )}
    <p>Detection Percentage: {detectionPercentage}%</p>
  </div>
);

export default function App() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFaceCurrentlyDetected, setIsFaceCurrentlyDetected] = useState(false);
  const [areMultipleFacesDetected, setAreMultipleFacesDetected] = useState(false);
  const [faceDetectedCount, setFaceDetectedCount] = useState(0);
  const [totalFramesProcessed, setTotalFramesProcessed] = useState(0);
  const [detectionPercentage, setDetectionPercentage] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const canvasRef = useRef(null);
  const webcamRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    loadHaarFaceModels().then(() => {
      console.log("Haar-cascade model loaded");
      setModelLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!modelLoaded) return;

    const canvas = canvasRef.current;

    const detectFace = async () => {
      if (!isActive || !webcamRef.current || !canvas || !imgRef.current) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      imgRef.current.src = imageSrc;

      return new Promise((resolve) => {
        imgRef.current.onload = async () => {
          let img;
          try {
            img = cv.imread(imgRef.current);
            const detectionResult = detectHaarFace(img);

            setIsFaceCurrentlyDetected(detectionResult.faceDetected);
            setAreMultipleFacesDetected(detectionResult.multipleFacesDetected);

            if (detectionResult.faceDetected) {
              setFaceDetectedCount((prevCount) => prevCount + 1);
            }
            setTotalFramesProcessed((prevCount) => prevCount + 1);
            cv.imshow(canvas, detectionResult.image);
          } catch (error) {
            console.error("Error during face detection:", error);
          } finally {
            if (img) {
              img.delete();
            }
            resolve();
          }
        };
      });
    };

    let intervalId;
    const startDetectionLoop = () => {
      intervalId = setInterval(async () => {
        await detectFace();
      }, 1000 / 24);
    };

    if (isActive && canvasRef.current) {
      canvasRef.current.style.display = "block";
      startDetectionLoop();
    } else if (canvasRef.current) {
      canvasRef.current.style.display = "none";
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [isActive, modelLoaded]);

  useEffect(() => {
    if (totalFramesProcessed > 0) {
      setDetectionPercentage(
        Math.round((faceDetectedCount / totalFramesProcessed) * 100)
      );
    } else {
      setDetectionPercentage(0);
    }
  }, [faceDetectedCount, totalFramesProcessed]);

  const handleStartFaceDetection = () => {
    setFaceDetectedCount(0);
    setTotalFramesProcessed(0);
    setIsActive(true);
    setAreMultipleFacesDetected(false);
    setIsTestRunning(true); // Test starts
    if (canvasRef.current) {
      canvasRef.current.style.display = "block";
    }

    // Stop test after 30 seconds
    setTimeout(() => {
      handleStopFaceDetection();
    }, 30000);
  };

  const handleStopFaceDetection = () => {
    setIsActive(false);
    setIsTestRunning(false); // Test ends
    if (canvasRef.current) {
      canvasRef.current.style.display = "none";
    }
  };

  return (
    <div className="app-container">
      <h1>In-Browser Proctoring</h1>
      <p>Click "Start Test" and ensure your face is visible in the camera.</p>

      <WebcamView webcamRef={webcamRef} canvasRef={canvasRef} imgRef={imgRef} mirrored screenshotFormat="image/jpeg" />
      <DetectionControls
        modelLoaded={modelLoaded}
        isActive={isActive}
        onStart={handleStartFaceDetection}
        onStop={handleStopFaceDetection}
        detectionPercentage={detectionPercentage}
        isTestRunning={isTestRunning}
      />

      <DetectionInfo
        isFaceCurrentlyDetected={isFaceCurrentlyDetected}
        areMultipleFacesDetected={areMultipleFacesDetected}
        detectionPercentage={detectionPercentage}
      />
    </div>
  );
}