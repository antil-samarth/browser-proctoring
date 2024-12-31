import React, { useState, useRef, useEffect } from "react";
import cv from "@techstark/opencv-js";
import { loadHaarFaceModels, detectHaarFace } from "./haarFaceDetection";
import "./styles.css";
import WebcamView from "./components/WebcamView";
import Header from "./components/Header";
import Footer from "./components/Footer";

const TIMER_DURATION = 30;
const FRAMES_PER_SECOND = 5;

const DetectionControls = ({ modelLoaded, isActive, onStart, onStop, isTestRunning }) => (
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

const Timer = ({ remainingTime }) => (
  <div className="timer">
    <img src="./assets/record.png" alt="record" width={20} height={20} />
    Time Remaining: {remainingTime}s
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
  const [remainingTime, setRemainingTime] = useState(0);
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
      }, 1000 / FRAMES_PER_SECOND);
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
    setRemainingTime(TIMER_DURATION);
    if (canvasRef.current) {
      canvasRef.current.style.display = "block";
    }

    const timerInterval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval);
          handleStopFaceDetection();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleStopFaceDetection = () => {
    setIsActive(false);
    setIsTestRunning(false);
    if (canvasRef.current) {
      canvasRef.current.style.display = "none";
    }
  };

  return (
    <div className="app-wrapper">
      <Header />

      <main className="app-container">
        <h1>In-Browser Proctoring</h1>
        <p>This is a demonstration of an AI-powered proctoring application built using React and OpenCV.js.
          It detects faces in real-time using the webcam feed and provides feedback on whether a face is
          currently detected, if multiple faces are present, and the overall detection percentage.
        </p>
        <p>
          Try it out! Click "Start Test" to see the proctoring in action.
        </p>

        {isTestRunning && <Timer remainingTime={remainingTime} />}

        <WebcamView webcamRef={webcamRef} canvasRef={canvasRef} imgRef={imgRef} mirrored screenshotFormat="image/jpeg" />
        <DetectionControls
          modelLoaded={modelLoaded}
          isActive={isActive}
          onStart={handleStartFaceDetection}
          onStop={handleStopFaceDetection}
          isTestRunning={isTestRunning}
        />

        <DetectionInfo
          isFaceCurrentlyDetected={isFaceCurrentlyDetected}
          areMultipleFacesDetected={areMultipleFacesDetected}
          detectionPercentage={detectionPercentage}
        />
      </main>

      <Footer />
    </div>
  );
}