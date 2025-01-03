import React from "react";

const Review = ({
  detectionPercentage,
  totalFramesProcessed,
  faceDetectedCount,
  secondsWithoutFace,
  faceDetectionTimeline,
}) => {
  const faceDetectedSeconds = faceDetectionTimeline.filter(
    (item) => item.detected
  ).length;
  const totalSeconds = faceDetectionTimeline.length;

  return (
    <div className="review">
      <h2>Proctoring Results</h2>
      <p>Test Duration: {totalSeconds} seconds</p>
      <p>Time Face Detected: {faceDetectedSeconds} seconds</p>
      <p>Time Face Not Detected: {secondsWithoutFace} seconds</p>
      <p>Detection Percentage: {detectionPercentage.toFixed(2)}%</p>
      <h3>Timeline:</h3>
      <div className="timeline">
        {faceDetectionTimeline.map((item) => (
          <div
            key={item.second}
            className={`timeline-item ${item.detected ? "detected" : "not-detected"
              }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Review;