import React from 'react';

const Review = ({ detectionPercentage, totalFramesProcessed, faceDetectedCount }) => {
  const faceNotDetectedCount = totalFramesProcessed - faceDetectedCount;

  return (
    <div className="review">
      <h2>Proctoring Results</h2>
      <p>Total Frames Processed: {totalFramesProcessed}</p>
      <p>Face Detected Frames: {faceDetectedCount}</p>
      <p>Face Not Detected Frames: {faceNotDetectedCount}</p>
      <p>Detection Percentage: {detectionPercentage}%</p>
      {/* <ul>
        <li>Average time face was not detected</li>
        <li>Number of times multiple faces were detected</li>
        <li>Timestamps of any alerts/warnings</li>
      </ul> */}
    </div>
  );
};

export default Review;