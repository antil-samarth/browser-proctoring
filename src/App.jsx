import React, { useState, useRef, useEffect } from "react";
import cv from "@techstark/opencv-js";

import { loadHaarFaceModels, detectHaarFace } from "./haarFaceDetection";

import WebcamView from "./components/WebcamView";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Settings from "./components/Settings";
import Review from "./components/Review";
import Instructions from "./components/Instructions";

import "./styles.css";

const DEFAULT_TIMER_DURATION = 30;
const DEFAULT_PERFORMANCE = "medium";
const DETECTION_THRESHOLD = 2 / 3;

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
	const [showSettings, setShowSettings] = useState(false);
	const [timerDuration, setTimerDuration] = useState(DEFAULT_TIMER_DURATION);
	const [performance, setPerformance] = useState(DEFAULT_PERFORMANCE);
	const [showReview, setShowReview] = useState(false);
	const [secondsWithoutFace, setSecondsWithoutFace] = useState(0);
	const [faceDetectionTimeline, setFaceDetectionTimeline] = useState([]);
	const canvasRef = useRef(null);
	const webcamRef = useRef(null);
	const imgRef = useRef(null);

	const handleStartFaceDetection = () => {
		setFaceDetectedCount(0);
		setTotalFramesProcessed(0);
		setDetectionPercentage(0);
		setSecondsWithoutFace(0);
		setFaceDetectionTimeline([]);
		setShowReview(false);
		setIsActive(true);
		setAreMultipleFacesDetected(false);
		setIsTestRunning(true);
		setRemainingTime(timerDuration);
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
		setShowReview(true);
	};

	const handleSaveSettings = ({ duration, performance }) => {
		setTimerDuration(duration);
		setPerformance(performance);
		setShowSettings(false);

		localStorage.setItem("timerDuration", duration);
		localStorage.setItem("performance", performance);
	};

	useEffect(() => {
		const storedTimerDuration = localStorage.getItem("timerDuration");
		const storedPerformance = localStorage.getItem("performance");

		if (storedTimerDuration) {
			setTimerDuration(parseInt(storedTimerDuration, 10));
		}
		if (storedPerformance) {
			setPerformance(storedPerformance);
		}

		loadHaarFaceModels().then(() => {
			console.log("Haar-cascade model loaded");
			setModelLoaded(true);
		});
	}, []);

	useEffect(() => {
		if (!modelLoaded) return;

		const canvas = canvasRef.current;
		let isDetecting = false;
		let frameCount = 0;
		let currentSecond = 0;
		let faceDetectedInCurrentSecond = false;
		let startTime = Date.now();

		const getFramesPerSecond = () => {
			switch (performance) {
				case "low":
					return 5;
				case "medium":
					return 15;
				case "high":
					return 24;
				default:
					return 15;
			}
		};

		const detectFace = async () => {
			if (!isActive || !webcamRef.current || !canvas || !imgRef.current || isDetecting) return;

			isDetecting = true;
			const imageSrc = webcamRef.current.getScreenshot();
			if (!imageSrc) {
				isDetecting = false;
				return;
			}

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
							faceDetectedInCurrentSecond = true;
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
			}).finally(() => {
				isDetecting = false;
			});
		};

		let intervalId;
		const startDetectionLoop = () => {
			const fps = getFramesPerSecond();
			const interval = 1000 / fps;

			intervalId = setInterval(() => {
				const currentTime = Date.now();
				const elapsed = currentTime - startTime;

				if (elapsed >= 1000) {
					const currentSecondStatus =
						frameCount / (fps * (elapsed / 1000)) >= DETECTION_THRESHOLD;

					setFaceDetectionTimeline((prevTimeline) => [
						...prevTimeline,
						{ 
							second: currentSecond, 
							detected: currentSecondStatus,
						},
					]);

					if (!currentSecondStatus) {
						setSecondsWithoutFace((prevSeconds) => prevSeconds + 1);
					}

					currentSecond++;
					frameCount = 0;
					startTime = currentTime;
				}

				if (faceDetectedInCurrentSecond) {
					frameCount++;
				}

				detectFace();
				faceDetectedInCurrentSecond = false;
			}, interval);
		};

		if (isActive && canvasRef.current) {
			canvasRef.current.style.display = "block";
			startDetectionLoop();
		} else if (canvasRef.current) {
			canvasRef.current.style.display = "none";
			clearInterval(intervalId);
		}

		return () => clearInterval(intervalId);
	}, [isActive, modelLoaded, performance]);

	useEffect(() => {
		if (totalFramesProcessed > 0) {
			setDetectionPercentage(
				Math.round((faceDetectedCount / totalFramesProcessed) * 100)
			);
		} else {
			setDetectionPercentage(0);
		}
	}, [faceDetectedCount, totalFramesProcessed]);

	return (
		<div className="app-wrapper">
			<Header />

			<main className="app-container">

				<Settings
					onSave={handleSaveSettings}
					initialDuration={timerDuration}
					initialPerformance={performance}
					showSettings={showSettings}
					setShowSettings={setShowSettings}
				/>

				<Instructions />

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

				{showReview && (
					<Review
						detectionPercentage={detectionPercentage}
						totalFramesProcessed={totalFramesProcessed}
						faceDetectedCount={faceDetectedCount}
						secondsWithoutFace={secondsWithoutFace}
						faceDetectionTimeline={faceDetectionTimeline}
					/>
				)}

			</main>

			<Footer />
		</div>
	);
}