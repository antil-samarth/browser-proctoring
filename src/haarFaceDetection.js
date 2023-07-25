import cv from "@techstark/opencv-js";
import { loadDataFile } from "./cvDataFile";

let faceCascade;
/* let faceDetectedTime = 0;
let totalTime = 0; */
const minSize = new cv.Size(120, 120);
const maxSize = new cv.Size(300, 300);
/* let pct1 = 0; */
let faceCheck = false;

export async function loadHaarFaceModels() {
  console.log("=======start downloading Haar-cascade models=======");
  return loadDataFile(
    "haarcascade_frontalface_default.xml",
    "models/haarcascade_frontalface_default.xml"
  )
    .then(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            // load pre-trained classifiers
            faceCascade = new cv.CascadeClassifier();
            faceCascade.load("haarcascade_frontalface_default.xml");
            resolve();
          }, 2000);
        })
    )
    .then(() => {
      console.log("=======downloaded Haar-cascade models=======");
    })
    .catch((error) => {
      console.error(error);
    });
}

export function detectHaarFace(img, count) {
  // const newImg = img.clone();
  const newImg = img;
  faceCheck = false;

  const gray = new cv.Mat();
  cv.cvtColor(newImg, gray, cv.COLOR_RGBA2GRAY, 0);

  const faces = new cv.RectVector();
  // detect faces
  faceCascade.detectMultiScale(gray, faces, 1.05, 4, 0, minSize, maxSize);
  if (faces.size() > 0) {
    
    for (let i = 0; i < faces.size(); ++i) {
      const point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
      const point2 = new cv.Point(
        faces.get(i).x + faces.get(i).width,
        faces.get(i).y + faces.get(i).height
      );
      cv.rectangle(newImg, point1, point2, [255, 0, 0, 255]);
      
    }faceCheck = true;
  }else{
    cv.putText(newImg, "Please look at the camera", { x: 50, y: 50 }, cv.FONT_HERSHEY_SIMPLEX, 1.0, [0, 0, 255, 255], 2);
  }
  return (newImg, faceCheck) ;
}

