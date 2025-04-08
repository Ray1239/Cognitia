"use client";

import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import angleBetweenThreePoints from "@/components/angle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Container, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { setDoc, doc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../../../firebase";
import Cookies from "js-cookie";

// Define types
interface Point {
  x: number;
  y: number;
}

interface PoseResults {
  poseLandmarks?: {
    x: number;
    y: number;
  }[];
}

const Squats: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countTextbox = useRef<HTMLInputElement>(null);
  const [count, setCount] = useState<number>(0);
  const [isWebcamReady, setIsWebcamReady] = useState<boolean>(false);
  let camera: cam.Camera | null = null;
  let dir: number = 0; // 0 = waiting for down, 1 = waiting for up

  useEffect(() => {
    const startTime: Date = new Date();
    const startTimeSec: number = startTime.getSeconds();
    localStorage.setItem("squatsStartTime", startTimeSec.toString());
    console.log("Start time:", startTime);
  }, []);

  const speak = (value: number): void => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(value.toString());
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("SpeechSynthesis not supported in this browser");
    }
  };

  function onResult(results: PoseResults): void {
    if (results.poseLandmarks && canvasRef.current && webcamRef.current?.video) {
      const position = results.poseLandmarks;
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      const width: number = canvasRef.current.width;
      const height: number = canvasRef.current.height;

      // Define landmarks for squat detection (hips and knees)
      const leftLeg: Point[] = [
        { x: position[23].x * width, y: position[23].y * height }, // Left hip
        { x: position[25].x * width, y: position[25].y * height }, // Left knee
        { x: position[27].x * width, y: position[27].y * height }, // Left ankle
      ];
      const rightLeg: Point[] = [
        { x: position[24].x * width, y: position[24].y * height }, // Right hip
        { x: position[26].x * width, y: position[26].y * height }, // Right knee
        { x: position[28].x * width, y: position[28].y * height }, // Right ankle
      ];
      const righthip: Point[] = [
        { x: position[12].x * width, y: position[12].y * height }, // Right shoulder
        { x: position[24].x * width, y: position[24].y * height }, // Right hip
        { x: position[26].x * width, y: position[26].y * height }, // Right knee
      ];
      const lefthip: Point[] = [
        { x: position[11].x * width, y: position[11].y * height }, // Left shoulder
        { x: position[23].x * width, y: position[23].y * height }, // Left hip
        { x: position[25].x * width, y: position[25].y * height }, // Left knee
      ];

      const leftKneeAngle: number = Math.round(angleBetweenThreePoints(leftLeg));
      const rightKneeAngle: number = Math.round(angleBetweenThreePoints(rightLeg));
      const rightHipAngle: number = Math.round(angleBetweenThreePoints(righthip));
      const leftHipAngle: number = Math.round(angleBetweenThreePoints(lefthip));

      const canvasElement: HTMLCanvasElement = canvasRef.current;
      const canvasCtx: CanvasRenderingContext2D | null = canvasElement.getContext("2d");

      if (canvasCtx) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Adjusted squat ranges
        const inRangeRightKneeDown: boolean = rightKneeAngle <= 110; // Relaxed squat down
        const inRangeLeftKneeDown: boolean = leftKneeAngle <= 110;   // Relaxed squat down
        const inRangeRightKneeUp: boolean = rightKneeAngle >= 150;   // Relaxed standing
        const inRangeLeftKneeUp: boolean = leftKneeAngle >= 150;     // Relaxed standing
        const inRangeRightHip: boolean = rightHipAngle >= 140 && rightHipAngle <= 180;
        const inRangeLeftHip: boolean = leftHipAngle >= 140 && leftHipAngle <= 180;

        // Draw lines for visualization
        for (let i = 0; i < 2; i++) {
          canvasCtx.beginPath();
          canvasCtx.lineWidth = 8;

          canvasCtx.moveTo(rightLeg[i].x, rightLeg[i].y);
          canvasCtx.lineTo(rightLeg[i + 1].x, rightLeg[i + 1].y);
          canvasCtx.strokeStyle = inRangeRightKneeUp ? "green" : "red";
          canvasCtx.stroke();

          canvasCtx.beginPath();
          canvasCtx.moveTo(leftLeg[i].x, leftLeg[i].y);
          canvasCtx.lineTo(leftLeg[i + 1].x, leftLeg[i + 1].y);
          canvasCtx.strokeStyle = inRangeLeftKneeUp ? "green" : "red";
          canvasCtx.stroke();

          canvasCtx.beginPath();
          canvasCtx.moveTo(righthip[i].x, righthip[i].y);
          canvasCtx.lineTo(righthip[i + 1].x, righthip[i + 1].y);
          canvasCtx.strokeStyle = inRangeRightHip ? "green" : "red";
          canvasCtx.stroke();

          canvasCtx.beginPath();
          canvasCtx.moveTo(lefthip[i].x, lefthip[i].y);
          canvasCtx.lineTo(lefthip[i + 1].x, lefthip[i + 1].y);
          canvasCtx.strokeStyle = inRangeLeftHip ? "green" : "red";
          canvasCtx.stroke();
        }

        // Draw points
        for (let i = 0; i < 3; i++) {
          canvasCtx.beginPath();
          canvasCtx.arc(rightLeg[i].x, rightLeg[i].y, 8, 0, Math.PI * 2);
          canvasCtx.arc(leftLeg[i].x, leftLeg[i].y, 8, 0, Math.PI * 2);
          canvasCtx.fillStyle = "#AAFF00";
          canvasCtx.fill();

          canvasCtx.beginPath();
          canvasCtx.arc(righthip[i].x, righthip[i].y, 8, 0, Math.PI * 2);
          canvasCtx.arc(lefthip[i].x, lefthip[i].y, 8, 0, Math.PI * 2);
          canvasCtx.fillStyle = "#AAFF00";
          canvasCtx.fill();
        }

        // Full cycle counting with debugging
        if (
          inRangeLeftKneeDown &&
          inRangeRightKneeDown &&
          inRangeRightHip &&
          inRangeLeftHip &&
          dir === 0
        ) {
          dir = 1; // Squat down detected
          console.log("Squat Down Detected - Angles:", {
            leftKnee: leftKneeAngle,
            rightKnee: rightKneeAngle,
            leftHip: leftHipAngle,
            rightHip: rightHipAngle,
          });
        } else if (
          inRangeLeftKneeUp &&
          inRangeRightKneeUp &&
          inRangeRightHip &&
          inRangeLeftHip &&
          dir === 1
        ) {
          setCount((prev) => {
            const newCount = prev + 1;
            speak(newCount);
            console.log("Squat Completed - Count:", newCount, {
              leftKnee: leftKneeAngle,
              rightKnee: rightKneeAngle,
              leftHip: leftHipAngle,
              rightHip: rightHipAngle,
            });
            return newCount;
          });
          dir = 0; // Standing detected, rep complete
        }

        // Draw angles for debugging
        canvasCtx.font = "30px Arial";
        canvasCtx.fillText(`${leftKneeAngle}`, leftLeg[1].x + 20, leftLeg[1].y + 20);
        canvasCtx.fillText(`${rightKneeAngle}`, rightLeg[1].x - 120, rightLeg[1].y + 20);
        canvasCtx.fillText(`${leftHipAngle}`, lefthip[1].x + 20, lefthip[1].y + 20);
        canvasCtx.fillText(`${rightHipAngle}`, righthip[1].x - 120, righthip[1].y + 20);

        canvasCtx.restore();
      }
    }
  }

  useEffect(() => {
    if (!isWebcamReady) return;

    const pose = new Pose({
      locateFile: (file: string): string => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResult);

    pose.initialize()
      .then(() => {
        console.log("Pose initialized");
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
  }, [isWebcamReady]);

  function resetCount(): void {
    setCount(0);
    dir = 0;
    speak(0); // Announce reset
    console.log("Count reset");
  }

  const handleClick = (): void => {
    const ID: string | undefined = Cookies.get("userID");
    if (ID) {
      const docRef = doc(db, `user/${ID}/squats`, uuidv4());
      const startTimeStamp: string | null = localStorage.getItem("squatsStartTime");
      const endTimeVar: Date = new Date();
      const endTimeStamp: number = endTimeVar.getSeconds();
      const timeSpent: number = startTimeStamp ? endTimeStamp - parseInt(startTimeStamp) : 0;

      setDoc(docRef, {
        reps: count,
        startTimeStamp: startTimeStamp || "",
        endTimeStamp: endTimeStamp,
        timeSpent: Math.abs(timeSpent),
        uid: ID,
        exerciseName: "Squats",
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
          onUserMedia={() => setIsWebcamReady(true)}
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
          Squats
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
          <img src="/Assets/squats.gif" width="100%" alt="Squats" />
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
              value={count}
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
              <Button color="primary" className="cursor-pointer" onClick={handleClick}>
                Back
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Squats;