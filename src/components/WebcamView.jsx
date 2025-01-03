import React from "react";
import Webcam from "react-webcam";

const WebcamView = React.forwardRef(
    ({ mirrored, screenshotFormat, webcamRef, canvasRef, imgRef }, ref) => {
        return (
            <div className="webcam-container">
                <Webcam
                    ref={webcamRef}
                    className="webcam"
                    mirrored={mirrored}
                    screenshotFormat={screenshotFormat}
                    audio={false}
                />
                <canvas className="output-canvas" ref={canvasRef} />
                <img
                    className="input-image"
                    alt="input"
                    ref={imgRef}
                    style={{ display: "none" }}
                />
            </div>
        );
    }
);

export default WebcamView;