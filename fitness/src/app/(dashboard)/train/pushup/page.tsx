"use client";
import React, { useEffect, useRef, RefObject } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import { Button, ButtonProps } from "@/components/ui/button";
import Link from "next/link";
import { Container, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { setDoc, doc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../../../firebase";
import Cookies from "js-cookie";

interface Point {
  x: number;
  y: number;
}

interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseResults {
  poseLandmarks?: NormalizedLandmark[];
}

interface WebcamWithVideo extends Webcam {
  video: HTMLVideoElement | null;
}

let count: number = 0;
let dir: number = 0;

const speech: SpeechSynthesis = window.speechSynthesis;
const speak = (count: number): void => {
  const object: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(count.toString());
  object.lang = "en-US";
  speech.speak(object);
};

const angleBetweenThreePoints = (points: Point[]): number => {
  const [p1, p2, p3] = points;
  const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  return Math.abs((angle * 180) / Math.PI);
};

const PushUPs: React.FC = () => {
  

  const webcamRef: RefObject<WebcamWithVideo> = useRef(null);
  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null);
  const countTextbox: RefObject<HTMLInputElement> = useRef(null);
  let camera: cam.Camera | null = null;

  useEffect(() => {
    const startTime: Date = new Date();
    const startTimeSec: number = startTime.getSeconds();
    localStorage.setItem("pushUpStartTime", startTimeSec.toString());
    console.log(startTime);
  }, []);

  function onResult(results: PoseResults): void {
    if (results.poseLandmarks && canvasRef.current && webcamRef.current?.video) {
      const position = results.poseLandmarks;
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      const width: number = canvasRef.current.width;
      const height: number = canvasRef.current.height;

      const leftHand: Point[] = [];
      const rightHand: Point[] = [];
      const righthip: Point[] = [];
      const lefthip: Point[] = [];
      const hiparr: number[] = [11, 12, 23, 24, 25, 26];

      for (let i = 11; i < 17; i++) {
        const obj: Point = {
          x: position[i].x * width,
          y: position[i].y * height,
        };
        if (i % 2 === 0) {
          rightHand.push(obj);
        } else {
          leftHand.push(obj);
        }
      }

      for (let i = 0; i < 6; i++) {
        const p: number = hiparr[i];
        const obj: Point = {
          x: position[p].x * width,
          y: position[p].y * height,
        };
        if (p % 2 === 0) {
          righthip.push(obj);
        } else {
          lefthip.push(obj);
        }
      }

      const leftHandAngle: number = Math.round(angleBetweenThreePoints(leftHand));
      const rightHandAngle: number = Math.round(angleBetweenThreePoints(rightHand));
      const rightHipAngle: number = Math.round(angleBetweenThreePoints(righthip));
      const leftHipAngle: number = Math.round(angleBetweenThreePoints(lefthip));

      const canvasElement: HTMLCanvasElement = canvasRef.current;
      const canvasCtx: CanvasRenderingContext2D | null = canvasElement.getContext("2d");

      if (canvasCtx) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        let inRangeRightHand: boolean = rightHandAngle <= 60;
        let inRangeLeftHand: boolean = leftHandAngle <= 60;
        let inRangeRightHip: boolean = rightHipAngle >= 160 && rightHipAngle <= 180;
        let inRangeLeftHip: boolean = leftHipAngle >= 160 && leftHipAngle <= 180;

        for (let i = 0; i < 2; i++) {
          canvasCtx.beginPath();
          canvasCtx.lineWidth = 8;

          canvasCtx.moveTo(rightHand[i].x, rightHand[i].y);
          canvasCtx.lineTo(rightHand[i + 1].x, rightHand[i + 1].y);
          canvasCtx.strokeStyle = inRangeRightHand ? "green" : "red";
          canvasCtx.stroke();

          canvasCtx.beginPath();
          canvasCtx.moveTo(leftHand[i].x, leftHand[i].y);
          canvasCtx.lineTo(leftHand[i + 1].x, leftHand[i + 1].y);
          canvasCtx.strokeStyle = inRangeLeftHand ? "green" : "red";
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

        for (let i = 0; i < 3; i++) {
          canvasCtx.beginPath();
          canvasCtx.arc(rightHand[i].x, rightHand[i].y, 8, 0, Math.PI * 2);
          canvasCtx.arc(leftHand[i].x, leftHand[i].y, 8, 0, Math.PI * 2);
          canvasCtx.fillStyle = "#AAFF00";
          canvasCtx.fill();

          canvasCtx.beginPath();
          canvasCtx.arc(righthip[i].x, righthip[i].y, 8, 0, Math.PI * 2);
          canvasCtx.arc(lefthip[i].x, lefthip[i].y, 8, 0, Math.PI * 2);
          canvasCtx.fillStyle = "#AAFF00";
          canvasCtx.fill();
        }

        if (inRangeLeftHand && inRangeRightHand && inRangeRightHip && inRangeLeftHip) {
          if (dir === 0) {
            count = count + 1;
            speak(count);
            dir = 1;
            console.log(count);
          }
        } else {
          dir = 0;
        }

        canvasCtx.font = "30px aerial";
        canvasCtx.fillText(`${leftHandAngle}`, leftHand[1].x + 20, leftHand[1].y + 20);
        canvasCtx.fillText(`${rightHandAngle}`, rightHand[1].x - 120, rightHand[1].y + 20);
        canvasCtx.fillText(`${leftHipAngle}`, lefthip[1].x + 20, lefthip[1].y + 20);
        canvasCtx.fillText(`${leftHipAngle}`, lefthip[1].x - 120, lefthip[1].y + 20);

        canvasCtx.restore();
      }
    }
  }

  useEffect(() => {
    if (!webcamRef.current || !webcamRef.current.video) return;
    const pose: Pose = new Pose({
      locateFile: (file: string): string => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResult);

    camera = new cam.Camera(webcamRef.current.video, {
      onFrame: async () => {
        if (countTextbox.current) {
          countTextbox.current.value = count.toString();
        }
        if (webcamRef.current && webcamRef.current.video) {
          await pose.send({ image: webcamRef.current.video });
        }
      },
      width: 640,
      height: 480,
    });
    camera.start();

    return () => {
      camera?.stop();
    };
  }, [webcamRef.current?.video]);

  function resetCount(): void {
    console.log("clicked");
    count = 0;
    if (countTextbox.current) {
      countTextbox.current.value = "0";
    }
  }

  const handleClick = (): void => {
    const ID: string | undefined = Cookies.get("userID");
    if (ID) {
      const docRef = doc(db, `user/${ID}/pushups`, uuidv4());
      const startTimeStamp: string | null = localStorage.getItem("pushUpStartTime");
      const endTimeVar: Date = new Date();
      const endTimeStamp: number = endTimeVar.getSeconds();
      const timeSpent: number = endTimeStamp - (startTimeStamp ? parseInt(startTimeStamp) : 0);

      setDoc(docRef, {
        reps: count,
        startTimeStamp: startTimeStamp || "",
        endTimeStamp: endTimeStamp,
        timeSpent: Math.abs(timeSpent),
        exceriseName: "PushUPs",
        uid: ID,
      })
        .then(() => {
          console.log("Document written");
        })
        .catch((error) => console.error("Error writing document: ", error));
    }
  };

  return (
    <Container
      maxWidth="xl"
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
          videoConstraints={{ width: 640, height: 480 }}
          onUserMedia={() => console.log("Webcam stream started")}
        />
        <canvas ref={canvasRef} className="full-width" style={{ position: "absolute" }} />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffff",
          borderRadius: "2rem",
          width: { lg: "40%", xs: "100%" },
        }}
      >
        <Typography variant="h4" color="primary" style={{ textTransform: "capitalize" }}>
          PushUps
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
          <img src="/Assets/finger-push-up.gif" width="100%" alt="pushups" />
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
              defaultValue={count}
              style={{
                height: 50,
                fontSize: 20,
                width: 80,
                padding: "1rem",
                border: "2px solid orange",
                borderRadius: "10px",
              }}
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
              <Button
                color="primary"
                onClick={handleClick}
              >
                Back
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default PushUPs;