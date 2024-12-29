import cv from "@techstark/opencv-js";
import { loadDataFile } from "./cvDataFile";

let faceCascade;
const minSize = new cv.Size(80, 80);
const maxSize = new cv.Size(400, 400);
const COLOR_GREEN = new cv.Scalar(0, 255, 0, 255);
const THICKNESS = 2;

export async function loadHaarFaceModels() {
  console.log("=======start downloading Haar-cascade models=======");
  try {
    await loadDataFile(
      "haarcascade_frontalface_default.xml",
      "models/haarcascade_frontalface_default.xml"
    );
    return new Promise((resolve) => {
      setTimeout(() => {
        faceCascade = new cv.CascadeClassifier();
        faceCascade.load("haarcascade_frontalface_default.xml");
        console.log("=======downloaded Haar-cascade models=======");
        resolve();
      }, 1500);
    });
  } catch (error) {
    console.error("Error loading Haar-cascade model:", error);
    throw error;
  }
}

export function detectHaarFace(img) {
  let faceDetected = false;
  let multipleFacesDetected = false;
  const gray = new cv.Mat();

  try {
    cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY, 0);

    const faces = new cv.RectVector();
    faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, minSize, maxSize);

    if (faces.size() > 0) {
      faceDetected = true;
      if (faces.size() > 1) {
        multipleFacesDetected = true;
      }
      for (let i = 0; i < faces.size(); ++i) {
        const faceRect = faces.get(i);
        const point1 = new cv.Point(faceRect.x, faceRect.y);
        const point2 = new cv.Point(faceRect.x + faceRect.width, faceRect.y + faceRect.height);
        cv.rectangle(img, point1, point2, COLOR_GREEN, THICKNESS);
      }
    }
    return { image: img, faceDetected, multipleFacesDetected };
  } catch (error) {
    console.error("Error in detectHaarFace:", error);
    return { image: img, faceDetected: false, multipleFacesDetected: false };
  } finally {
    gray.delete();
  }
}