"use client";

import React, { useState, useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import angleBetweenThreePoints from "@/components/angle";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Added for navigation
import { Container, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { setDoc, doc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../../../firebase";
import Cookies from "js-cookie";

// Define interfaces
interface Point {
  x: number;
  y: number;
}

interface ExerciseInfo {
  index: number[];
  ul: number;
  ll: number;
}

interface PoseResults {
  poseLandmarks?: {
    x: number;
    y: number;
  }[];
}

interface CounterProps {
  exercise: string;
}

// Exercise configuration
const exrInfo: { [key: string]: ExerciseInfo } = {
  crunches: {
    index: [12, 24, 26], // Right shoulder, right hip, right knee
    ul: 130,
    ll: 50,
  },
};

const Counter: React.FC<CounterProps> = ({ exercise }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countTextbox = useRef<HTMLInputElement>(null);
  const [count, setCount] = useState<number>(0); // Use state for count
  const [isWebcamReady, setIsWebcamReady] = useState<boolean>(false);
  let camera: cam.Camera | null = null;
  let dir: number = 0; // 0 = waiting for up, 1 = waiting for down
  let hasCounted: boolean = false; // Prevent double counting

  // Get start time
  useEffect(() => {
    const startTime: Date = new Date();
    const startTimeSec: number = startTime.getSeconds();
    localStorage.setItem("crunchesStartTime", startTimeSec.toString());
    console.log("Start time:", startTime);
  }, []);

  const speak = (value: number): void => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Clear previous speech
      const utterance = new SpeechSynthesisUtterance(value.toString());
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("SpeechSynthesis not supported in this browser");
    }
  };

  function onResult(results: PoseResults): void {
    console.log("onResult called"); // Debug: Check if this runs
    if (!results.poseLandmarks) {
      console.log("No pose landmarks detected");
      return;
    }
    console.log("Pose landmarks detected:", results.poseLandmarks);

    if (canvasRef.current && webcamRef.current?.video) {
      const position = results.poseLandmarks;
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      const width: number = canvasRef.current.width;
      const height: number = canvasRef.current.height;

      const exerciseKey = exercise.toLowerCase();
      if (!exrInfo[exerciseKey]) {
        console.error(`Exercise "${exercise}" not found in exrInfo`);
        return;
      }

      const updatedPos: Point[] = [];
      const indexArray: number[] = exrInfo[exerciseKey].index;

      for (let i = 0; i < 3; i++) {
        updatedPos.push({
          x: position[indexArray[i]].x * width,
          y: position[indexArray[i]].y * height,
        });
      }

      const angle: number = Math.round(angleBetweenThreePoints(updatedPos));
      console.log("Calculated angle:", angle);

      // Count reps
      if (angle > exrInfo[exerciseKey].ul && dir === 0) {
        dir = 1;
        hasCounted = false;
        console.log("Up Detected - Angle:", angle);
      } else if (angle < exrInfo[exerciseKey].ll && dir === 1 && !hasCounted) {
        setCount((prev) => {
          const newCount = prev + 1;
          speak(newCount);
          console.log("Crunch Completed - Count:", newCount, "Angle:", angle);
          return newCount;
        });
        dir = 0;
        hasCounted = true;
      }

      const canvasElement: HTMLCanvasElement = canvasRef.current;
      const canvasCtx: CanvasRenderingContext2D | null = canvasElement.getContext("2d");

      if (canvasCtx) {
        console.log("Drawing on canvas"); // Debug: Confirm drawing
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Draw lines
        for (let i = 0; i < 2; i++) {
          canvasCtx.beginPath();
          canvasCtx.moveTo(updatedPos[i].x, updatedPos[i].y);
          canvasCtx.lineTo(updatedPos[i + 1].x, updatedPos[i + 1].y);
          canvasCtx.lineWidth = 2;
          canvasCtx.strokeStyle = "white";
          canvasCtx.stroke();
        }

        // Draw points
        for (let i = 0; i < 3; i++) {
          canvasCtx.beginPath();
          canvasCtx.arc(updatedPos[i].x, updatedPos[i].y, 10, 0, Math.PI * 2);
          canvasCtx.fillStyle = "#AAFF00";
          canvasCtx.fill();
        }

        // Draw angle
        canvasCtx.font = "40px Arial"; // Fixed typo: "aerial" -> "Arial"
        canvasCtx.fillStyle = "white"; // Ensure text visibility
        canvasCtx.fillText(`${angle}`, updatedPos[1].x + 10, updatedPos[1].y + 40);
        canvasCtx.restore();
      } else {
        console.error("Canvas context not available");
      }
    }
  }

  useEffect(() => {
    console.log("useEffect triggered, isWebcamReady:", isWebcamReady);
    if (!isWebcamReady) return;

    const pose = new Pose({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`; // Stable version
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResult);

    pose.initialize()
      .then(() => {
        console.log("Pose initialized successfully");
        if (webcamRef.current?.video) {
          camera = new cam.Camera(webcamRef.current.video, {
            onFrame: async () => {
              if (webcamRef.current?.video) {
                await pose.send({ image: webcamRef.current.video });
              }
            },
            width: 640,
            height: 480,
          });
          camera.start();
          console.log("Camera started");
        }
      })
      .catch((err) => console.error("Pose initialization failed:", err));

    return () => {
      if (camera) {
        camera.stop();
        console.log("Camera stopped");
      }
    };
  }, [isWebcamReady]); // Depend on webcam readiness

  function resetCount(): void {
    setCount(0);
    dir = 0;
    hasCounted = false;
    speak(0);
    console.log("Count reset");
  }

  const handleClick = (): void => {
    const ID: string | undefined = Cookies.get("userID");
    if (ID) {
      const docRef = doc(db, `user/${ID}/crunches`, uuidv4());
      const startTimeStamp: string | null = localStorage.getItem("crunchesStartTime");
      const endTimeVar: Date = new Date();
      const endTimeStamp: number = endTimeVar.getSeconds();
      const timeSpent: number = startTimeStamp ? endTimeStamp - parseInt(startTimeStamp) : 0;

      setDoc(docRef, {
        reps: count,
        startTimeStamp: startTimeStamp || "",
        endTimeStamp: endTimeStamp,
        timeSpent: Math.abs(timeSpent),
        exerciseName: "Crunches", // Fixed typo: "exceriseName" -> "exerciseName"
        uid: ID,
      })
        .then(() => console.log("Document written successfully"))
        .catch((error) => console.error("Error writing document: ", error));
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "space-around",
        marginTop: "2rem",
        flexDirection: { lg: "row", xs: "column" },
        gap: "2rem",
      }}
    >
      <Box
        sx={{
          display: "flex",
          position: "relative",
          borderRadius: "2rem",
          width: "100%",
        }}
      >
        <Webcam
          ref={webcamRef}
          className="full-width"
          onUserMedia={() => {
            console.log("Webcam ready");
            setIsWebcamReady(true); // Trigger pose detection
          }}
          onUserMediaError={(err) => console.error("Webcam error:", err)}
        />
        <canvas
          ref={canvasRef}
          className="full-width"
          style={{ position: "absolute" }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          borderRadius: "2rem",
          width: { lg: "40%", xs: "100%" },
        }}
      >
        <Typography variant="h4" color="primary" style={{ textTransform: "capitalize" }}>
          Crunches
        </Typography>
        <Box
          sx={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src="/Assets/Crunch.gif" width="100%" alt="Crunches" />
        </Box>
        <br />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem",
            padding: "1rem",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2rem",
              padding: "1rem",
            }}
          >
            <Typography variant="h6" color="secondary">
              Count
            </Typography>
            <input
              ref={countTextbox}
              value={count} // Bind to state
              style={{
                height: 50,
                fontSize: 20,
                width: 80,
                padding: "1rem",
                border: "2px solid orange",
                borderRadius: "10px",
              }}
              readOnly
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "2rem",
              borderRadius: "2rem",
            }}
          >
            <Button color="primary" onClick={resetCount}>
              Reset Counter
            </Button>
            <Link href="/workout">
              <Button color="primary" onClick={handleClick}>
                Back
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

// Export with specific prop value for crunches
const CrunchesPage = () => <Counter exercise="crunches" />;
export default CrunchesPage;