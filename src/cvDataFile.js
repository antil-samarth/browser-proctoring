import cv from "@techstark/opencv-js";

export async function loadDataFile(cvFilePath, url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const data = new Uint8Array(buffer);
  cv.FS_createDataFile("/", cvFilePath, data, true, false, false);
}
