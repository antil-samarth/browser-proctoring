# In-Browser Proctoring

This project implements real-time face detection using OpenCV.js for in-browser proctoring. It captures webcam images, detects faces using Haar-cascade models, and displays detection results on a canvas.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Components](#components)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/antil-samarth/browser-proctoring/
    cd browser-proctoring
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Start the development server:
    ```sh
    npm start
    ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Click the "Start Test" button to begin face detection.
3. Ensure your face is visible in the camera.
4. The detection results will be displayed on the screen.

## Project Structure

```sh
├── public/ 
│ ├── assets/ 
│ ├── index.html 
│ └── models/ 
│ └── haarcascade_frontalface_default.xml 
├── src/
│ ├── App.jsx 
│ ├── components/ 
│ │ └── WebcamView.jsx 
│ ├── cvDataFile.js 
│ ├── haarFaceDetection.js 
│ ├── hooks/ 
│ ├── index.jsx 
│ └── styles.css 
├── .gitignore 
├── package.json 
└── README.md
```


## Components

### App.jsx

The main component that manages the state and handles the face detection logic.

### WebcamView.jsx

A component that displays the webcam feed and captures screenshots.

### haarFaceDetection.js

Contains functions to load Haar-cascade models and detect faces in images.

### cvDataFile.js

Handles loading of data files required by OpenCV.js.
