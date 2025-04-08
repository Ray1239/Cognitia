"use client";
import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import angleBetweenThreePoints from "@/components/angle";
import { Button } from "@/components/ui/button";
import { Container, Typography, Grid, Avatar, Paper, Badge } from "@mui/material";
import { Box } from "@mui/system";
import { doc, setDoc, onSnapshot, collection, updateDoc, addDoc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase/clientApp";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

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

interface Participant {
  id: string;
  name: string;
  count: number;
  avatarUrl?: string;
  isHost: boolean;
  peerId?: string;
  com : any
}

// WebRTC related types
interface PeerConnection {
  connection: RTCPeerConnection;
  videoStream?: MediaStream;
}

interface PeerStreams {
  [peerId: string]: {
    stream: MediaStream;
    participantId: string;
  };
}

// ICE server configuration
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// Add this at the top of your component
const sanitizeEmail = (email: string | null | undefined): string => {
  if (!email) return '';
  return email.replace(/\./g, '_dot_');
};


const speak = (count: number): void => {
  const speech: SpeechSynthesis = window.speechSynthesis;
  const object: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(count.toString());
  object.lang = "en-US";
  if (count === 0) {
    const resetMessage = new SpeechSynthesisUtterance("Please Start Again");
    resetMessage.lang = "en-US";
    speech.speak(resetMessage);
  } else {
    speech.speak(object);
  }
};

const MultiplayerBicepCurls: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countTextbox = useRef<HTMLInputElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isWebcamReady, setIsWebcamReady] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [isHost, setIsHost] = useState<boolean>(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sessionStarted, setSessionStarted] = useState<boolean>(false);
  const [sessionName, setSessionName] = useState<string>("");
  const [joinCode, setJoinCode] = useState<string>("");
  
  // WebRTC states
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnections, setPeerConnections] = useState<{[key: string]: PeerConnection}>({});
  const [peerStreams, setPeerStreams] = useState<PeerStreams>({});
  const [myPeerId, setMyPeerId] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  let camera: cam.Camera | null = null;
  let dir: number = 0; // 0 = waiting for down, 1 = waiting for up

  // Add this new function to create a grid layout for all videos
  const renderVideoGrid = () => {
    if (!sessionStarted || Object.keys(peerStreams).length === 0) return null;
    
    return (
      <Grid container spacing={2} sx={{ mt: 3 }}>
        {/* Local video */}
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ 
            position: 'relative', 
            height: '200px', 
            borderRadius: '8px', 
            overflow: 'hidden',
            backgroundColor: 'black',
            mb: 1
          }}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Box sx={{ 
              position: 'absolute', 
              bottom: '8px', 
              left: '8px',
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              px: 1,
              py: 0.5,
              borderRadius: '4px'
            }}>
              {session?.user?.name || 'You'} (You)
            </Box>
            <Box sx={{ 
              position: 'absolute', 
              bottom: '8px', 
              right: '8px',
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              px: 1,
              py: 0.5,
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {count} reps
            </Box>
            <Badge 
              color={isMuted ? "error" : "success"} 
              variant="dot"
              sx={{ 
                position: 'absolute', 
                top: '8px', 
                right: '8px',
                p: 1,
                bgcolor: 'rgba(0,0,0,0.6)',
                borderRadius: '50%'
              }}
            />
          </Box>
        </Grid>
        
        {/* Peer videos */}
        {Object.keys(peerStreams).map(peerId => {
          const participantId = peerStreams[peerId].participantId;
          const participant = participants.find(p => p.id === participantId);
          if (!participant) return null;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={peerId}>
              <Box sx={{ 
                position: 'relative', 
                height: '200px', 
                borderRadius: '8px', 
                overflow: 'hidden',
                backgroundColor: 'black',
                mb: 1
              }}>
                <video
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  ref={el => {
                    if (el && peerStreams[peerId]) {
                      el.srcObject = peerStreams[peerId].stream;
                    }
                  }}
                />
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: '8px', 
                  left: '8px',
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  px: 1,
                  py: 0.5,
                  borderRadius: '4px'
                }}>
                  {participant.name || participant?.com.name || 'Participant'} {participant.isHost || participant.com.isHost && "(Host)"}
                </Box>
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: '8px', 
                  right: '8px',
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  px: 1,
                  py: 0.5,
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {participant.count || participant.com.count} reps
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Initialize WebRTC
  useEffect(() => {
    if (!session?.user?.email || !sessionId || !sessionStarted) return;

    const initializeWebRTC = async () => {
      try {
        // Generate a unique peer ID
        const peerId = uuidv4();
        setMyPeerId(peerId);
        
        // Get user media
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(mediaStream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
        
        // Update Firebase with our peer ID
        const participantId = sanitizeEmail(session.user.email);
        const sessionRef = doc(db, "workoutSessions", sessionId);
        await updateDoc(sessionRef, {
          [`participants.${participantId}.peerId`]: peerId
        });
        
        // Listen for signaling data in Firebase
        const signalingRef = collection(db, "workoutSessions", sessionId, "signaling");
        onSnapshot(signalingRef, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              if (data.to === peerId) {
                handleSignalingMessage(data);
              }
            }
          });
        });
      } catch (error) {
        console.error("Error initializing WebRTC:", error);
      }
    };
    
    initializeWebRTC();
    
    return () => {
      // Clean up WebRTC connections
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      // Close all peer connections
      Object.values(peerConnections).forEach(({ connection }) => {
        connection.close();
      });
    };
  }, [session, sessionId, sessionStarted]);

  // Handle WebRTC connections with new participants
  useEffect(() => {
    if (!myPeerId || !localStream) return;
    
    // Check for new participants with peer IDs
    participants.forEach(async (participant) => {
      const participantId = participant.id;
      const participantPeerId = participant.peerId;
      
      // Skip ourselves
      if (participantId === session?.user?.email) return;
      
      // Skip if we already have a connection
      if (participantPeerId && !peerConnections[participantPeerId]) {
        // Create a new connection for this peer
        if (isHost || (participant.isHost && !isHost)) {
          await createPeerConnection(participantPeerId, participantId);
        }
      }
    });
  }, [participants, myPeerId, localStream]);

  // Create a peer connection and send an offer
  const createPeerConnection = async (peerId: string, participantId: string) => {
    try {
      const peerConnection = new RTCPeerConnection(iceServers);
      
      // Add local tracks to the connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        });
      }
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalingMessage({
            type: "ice-candidate",
            candidate: event.candidate,
            from: myPeerId,
            to: peerId
          });
        }
      };
      
      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setPeerStreams(prev => ({
            ...prev,
            [peerId]: {
              stream: event.streams[0],
              participantId
            }
          }));
        }
      };
      
      // Create and send an offer if we're initiating
      if (isHost || (participants.find(p => p.id === participantId)?.isHost && !isHost)) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        sendSignalingMessage({
          type: "offer",
          offer: offer,
          from: myPeerId,
          to: peerId
        });
      }
      
      // Store the connection
      setPeerConnections(prev => ({
        ...prev,
        [peerId]: { connection: peerConnection }
      }));
      
      return peerConnection;
    } catch (error) {
      console.error("Error creating peer connection:", error);
      return null;
    }
  };

  // Send signaling data through Firebase
  const sendSignalingMessage = async (message: any) => {
    try {
      await addDoc(collection(db, "workoutSessions", sessionId, "signaling"), message);
    } catch (error) {
      console.error("Error sending signaling message:", error);
    }
  };

  // Handle incoming signaling messages
  const handleSignalingMessage = async (data: any) => {
    try {
      const { type, from } = data;
      
      if (type === "offer") {
        // Get or create a peer connection
        let peerConnection = peerConnections[from]?.connection;
        
        if (!peerConnection) {
          const participant = participants.find(p => p.peerId === from);
          console.log("Looking for participant with peerId:", from);
          console.log("Available participants:", participants);
          if (!participant) return;
          
          const newPeerConnection = await createPeerConnection(from, participant.id);
          if (!newPeerConnection) {
            console.error("Failed to create peer connection");
            return;
          }
          peerConnection = newPeerConnection as RTCPeerConnection;
        }
        
        // Set the remote description
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        // Create and send an answer
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        sendSignalingMessage({
          type: "answer",
          answer: answer,
          from: myPeerId,
          to: from
        });
      }
      else if (type === "answer") {
        const peerConnection = peerConnections[from]?.connection;
        if (peerConnection) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
      }
      else if (type === "ice-candidate") {
        const peerConnection = peerConnections[from]?.connection;
        if (peerConnection) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      }
    } catch (error) {
      console.error("Error handling signaling message:", error);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Initialize session either by joining or creating
  useEffect(() => {
    const sessionCode = searchParams.get('session');
    
    if (!session?.user?.email) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    const initializeSession = async () => {
      if (sessionCode) {
        // Join existing session
        const sessionRef = doc(db, "workoutSessions", sessionCode);
        const sessionDoc = await getDoc(sessionRef);
        
        if (sessionDoc.exists()) {
          setSessionId(sessionCode);
          setSessionName(sessionDoc.data().name || "Bicep Curl Session");
          setIsHost(false);
          
          // Add participant to session
          const participantId = sanitizeEmail(session.user.email);
          const avatarFallback = session.user.name
            ? session.user.name
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "??";

          await updateDoc(sessionRef, {
            [`participants.${participantId}`]: {
              name: session.user.name,
              avatarUrl: session.user.image || avatarFallback,
              count: 0,
              isHost: false,
              joinedAt: new Date()
            }
          });
          
          setJoinCode(sessionCode);
        } else {
          // Invalid session code
          alert("Invalid session code");
          router.push('/workout');
        }
      } else {
        // Create new session
        const sessionId = uuidv4().substring(0, 8);
        setSessionId(sessionId);
        setIsHost(true);
        setSessionName(`${session.user.name}'s Workout`);
        
        const sessionRef = doc(db, "workoutSessions", sessionId);
        const hostId = sanitizeEmail(session.user.email);
        const avatarFallback = session.user.name
          ? session.user.name
              .split(" ")
              .map((n) => n.charAt(0))
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "??";

        await setDoc(sessionRef, {
          name: `${session.user.name}'s Workout`,
          createdAt: new Date(),
          createdBy: hostId,
          exerciseType: "bicepCurls",
          status: "waiting",
          participants: {
            [String(hostId)]: {
              name: session.user.name,
              avatarUrl: session.user.image || avatarFallback,
              count: 0,
              isHost: true,
              joinedAt: new Date()
            }
          }
        });
        
        setJoinCode(sessionId);
      }
    };
    
    initializeSession();
  }, [session, searchParams, router]);

  // Listen for session updates
  // Modify your Firebase snapshot handler
  useEffect(() => {
    if (!sessionId) return;
    
    const unsubscribe = onSnapshot(
      doc(db, "workoutSessions", sessionId),
      (doc) => {
        if (doc.exists()) {
          const sessionData = doc.data();
          setSessionStarted(sessionData.status === "active");
          
          // Validate and parse participants
          const participantsObj = sessionData.participants || {};
          console.log("Raw participants data:", participantsObj);
          
          if (typeof participantsObj === "object") {
            try {
              const participantsArray = Object.entries(participantsObj).map(([id, data]) => {
                if (!data) return null;

                const participantData = data as {
                  name?: string;
                  count?: number;
                  avatarUrl?: string;
                  isHost?: boolean;
                  peerId?: string;
                };

                return {
                  id,
                  name: participantData.name || "Unnamed User",
                  count: participantData.count || 0,
                  avatarUrl: participantData.avatarUrl, // Explicitly optional
                  isHost: !!participantData.isHost,
                  peerId: participantData.peerId
                } as Participant; // Explicitly cast to Participant
              }).filter(Boolean);
              
              console.log("Processed participants:", participantsArray);
              setParticipants(participantsArray as Participant[]);
            } catch (err) {
              console.error("Error processing participants:", err);
            }
          } else {
            console.error("Invalid participants data format:", participantsObj);
          }
        } else {
          console.error("Session document does not exist.");
        }
      },
      (error) => {
        console.error("Error listening to session updates:", error);
      }
    );
    
    return () => unsubscribe();
  }, [sessionId]);

  // Start session timer
  useEffect(() => {
    if (sessionStarted) {
      const startTime: Date = new Date();
      const startTimeSec: number = startTime.getSeconds();
      localStorage.setItem("bicepStartTime", startTimeSec.toString());
    }
  }, [sessionStarted]);

  function onResult(results: PoseResults): void {
    if (!results.poseLandmarks || !sessionStarted) return;
    
    const position = results.poseLandmarks;
    if (canvasRef.current && webcamRef.current?.video) {
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

        const inRangeRightHandUp: boolean = rightHandAngle <= 20; // Arm curled
        const inRangeLeftHandUp: boolean = leftHandAngle <= 20; // Arm curled
        const inRangeRightHandDown: boolean = rightHandAngle >= 90; // Arm extended
        const inRangeLeftHandDown: boolean = leftHandAngle >= 90; // Arm extended
        const inRangeRightHip: boolean = rightHipAngle >= 170 && rightHipAngle <= 180;
        const inRangeLeftHip: boolean = leftHipAngle >= 170 && leftHipAngle <= 180;

        // Draw lines
        for (let i = 0; i < 2; i++) {
          canvasCtx.beginPath();
          canvasCtx.lineWidth = 8;

          canvasCtx.moveTo(rightHand[i].x, rightHand[i].y);
          canvasCtx.lineTo(rightHand[i + 1].x, rightHand[i + 1].y);
          canvasCtx.strokeStyle = inRangeRightHandUp ? "green" : "red";
          canvasCtx.stroke();

          canvasCtx.beginPath();
          canvasCtx.moveTo(leftHand[i].x, leftHand[i].y);
          canvasCtx.lineTo(leftHand[i + 1].x, leftHand[i + 1].y);
          canvasCtx.strokeStyle = inRangeLeftHandUp ? "green" : "red";
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

        // Updated counting logic: Full cycle (down → up)
        if (
          inRangeLeftHandDown &&
          inRangeRightHandDown &&
          inRangeRightHip &&
          inRangeLeftHip &&
          dir === 0
        ) {
          dir = 1; // Arms extended, waiting for curl up
        } else if (
          inRangeLeftHandUp &&
          inRangeRightHandUp &&
          inRangeRightHip &&
          inRangeLeftHip &&
          dir === 1
        ) {
          const newCount = count + 1;
          setCount(newCount);
          updateUserCount(newCount);
          speak(newCount);
          dir = 0; // Arms curled, rep complete, reset to wait for down
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

  // Update user's count in Firebase
  const updateUserCount = async (newCount: number) => {
    if (!sessionId || !session?.user?.email) return;
    
    const sessionRef = doc(db, "workoutSessions", sessionId);
    const participantId = sanitizeEmail(session.user.email);
    
    await updateDoc(sessionRef, {
      [`participants.${participantId}.count`]: newCount
    });
  };

  useEffect(() => {
    if (!isWebcamReady || !sessionStarted) return;

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
        if (webcamRef.current?.video) {
          camera = new cam.Camera(webcamRef.current.video, {
            onFrame: async () => {
              if (countTextbox.current) {
                countTextbox.current.value = count.toString();
              }
              if (webcamRef.current?.video) {
                await pose.send({ image: webcamRef.current.video });
              }
            },
            width: 640,
            height: 480,
          });
          camera.start();
        }
      })
      .catch((err) => console.error("Pose initialization failed:", err));

    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, [isWebcamReady, sessionStarted, count]);

  const resetCount = async (): Promise<void> => {
    setCount(0);
    await updateUserCount(0);
    speak(0);
  };

  const startSession = async (): Promise<void> => {
    if (!sessionId) return;
    
    const sessionRef = doc(db, "workoutSessions", sessionId);
    await updateDoc(sessionRef, {
      status: "active",
      startedAt: new Date()
    });
    
    setSessionStarted(true);
  };

  const endSession = async (): Promise<void> => {
    if (!sessionId) return;
    
    // Mark session as completed in Firebase
    const sessionRef = doc(db, "workoutSessions", sessionId);
    await updateDoc(sessionRef, {
      status: "completed",
      endedAt: new Date()
    });
    
    // Save session results to Postgres using API
    const startTimeStr = localStorage.getItem("bicepStartTime");
    const endTimeVar = new Date();
    const endTimeStamp = endTimeVar.getSeconds();
    const timeSpent = startTimeStr ? Math.abs(endTimeStamp - parseInt(startTimeStr)) : 0;
    
    try {
      // Save the session data to your Postgres DB via API
      const response = await fetch('/api/workout-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          participants: participants.map(p => ({
            userId: p.id,
            name: p.name,
            count: p.count
          })),
          exerciseType: 'bicepCurls',
          timeSpent,
          startedAt: localStorage.getItem("bicepStartTime"),
          endedAt: endTimeStamp.toString()
        }),
      });
      
      if (response.ok) {
        router.push('/workout/history');
      } else {
        console.error('Failed to save session to database');
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const copySessionLink = () => {
    const baseUrl = window.location.origin;
    const sessionLink = `${baseUrl}/workout/bicep-curls?session=${joinCode}`;
    navigator.clipboard.writeText(sessionLink);
    alert("Session link copied to clipboard!");
  };

  // JSX for participant video display
  const renderParticipantVideo = (peerId: string, participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    console.log("Participant:", participant);
    if (!participant) return null;
    
    return (
      <Box sx={{ mb: 2, position: 'relative' }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
          {participant.name} {participant.isHost ? "(Host)" : ""}
        </Typography>
        <Box sx={{ 
          position: 'relative', 
          height: '150px', 
          borderRadius: '8px', 
          overflow: 'hidden',
          backgroundColor: 'black'
        }}>
          <video
            ref={el => {
              if (el && peerStreams[peerId]) {
                el.srcObject = peerStreams[peerId].stream;
              }
            }}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Box sx={{ 
            position: 'absolute', 
            bottom: '8px', 
            right: '8px',
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            px: 1,
            py: 0.5,
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {participant.count} reps
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        {sessionName}
      </Typography>
      
      {!sessionStarted && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Session Code: <strong>{joinCode}</strong>
          </Typography>
          <Button color="primary" onClick={copySessionLink} style={{ marginRight: '8px' }}>
            Copy Invite Link
          </Button>
          {isHost && (
            <Button color="primary" variant="default" onClick={startSession}>
              Start Session
            </Button>
          )}
          {!isHost && (
            <Typography variant="body1">
              Waiting for host to start the session...
            </Typography>
          )}
        </Box>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              display: "flex",
              position: "relative",
              borderRadius: "1rem",
              overflow: "hidden",
              height: "480px",
              bgcolor: "grey.900",
            }}
          >
            {sessionStarted ? (
              <>
                <Webcam
                  ref={webcamRef}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onUserMedia={() => setIsWebcamReady(true)}
                  onUserMediaError={(err) => console.error("Webcam error:", err)}
                />
                <canvas
                  ref={canvasRef}
                  style={{ position: "absolute", width: '100%', height: '100%' }}
                />
              </>
            ) : (
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                width: "100%",
                height: "100%",
                bgcolor: "grey.100"
              }}>
                <Typography variant="h5" color="text.secondary">
                  Webcam will activate when session starts
                </Typography>
              </Box>
            )}
          </Box>
          
          {sessionStarted && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" color="secondary" sx={{ mr: 2 }}>
                  Your Count:
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
                    textAlign: "center",
                  }}
                  readOnly
                />
              </Box>
              
              <Box sx={{ display: 'flex' }}>
                <Button 
                  color={isMuted ? "error" : "primary"} 
                  onClick={toggleAudio} 
                  style={{ marginRight: '8px' }}
                >
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
                <Button 
                  color={isVideoOff ? "error" : "primary"} 
                  onClick={toggleVideo} 
                  style={{ marginRight: '8px' }}
                >
                  {isVideoOff ? "Show Video" : "Hide Video"}
                </Button>
                <Button color="primary" onClick={resetCount} style={{ marginRight: '8px' }}>
                  Reset Counter
                </Button>
                {isHost && (
                  <Button color="primary" variant="default" onClick={endSession}>
                    End Session
                  </Button>
                )}
              </Box>
            </Box>
          )}

          <Grid item xs={12}>
            {renderVideoGrid()}
          </Grid>
          
          {/* Local Video Preview (small) */}
          {sessionStarted && localStream && (
            <Box sx={{ 
              position: 'absolute', 
              bottom: '16px', 
              left: '16px',
              width: '180px',
              height: '120px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid white',
              zIndex: 10
            }}>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Badge 
                color={isMuted ? "error" : "success"} 
                variant="dot"
                sx={{ 
                  position: 'absolute', 
                  bottom: '8px', 
                  right: '8px',
                  p: 1,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%'
                }}
              />
            </Box>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: '1rem',
              height: sessionStarted ? '100%' : 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Participants
            </Typography>
            
            <Box sx={{ mb: 2, flex: 1, overflowY: 'auto' }}>
              {participants.length > 0 ? (
                <Box>
                  {/* Participants with Video Feeds */}
                  {sessionStarted && (
                    <Box sx={{ mb: 4 }}>
                      {Object.keys(peerStreams).map(peerId => {
                        // Debugging to verify data
                        console.log("Peer streams:", peerStreams);
                        const participantId = peerStreams[peerId].participantId;
                        const participantData = participants.find(p => p.id === participantId);
                        console.log("Rendering participant:", participantData);
                        return renderParticipantVideo(peerId, participantId);
                      })}
                    </Box>
                  )}
                
                  {/* Participant List */}
                  {participants.map((participant) => {
                    // Debugging
                    console.log("Rendering participant in list:", participant);
                    
                    const avatarFallback = participant.name
                      ? participant.name
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "??";

                    // Skip if we're already showing their video feed
                    if (sessionStarted && Object.values(peerStreams).some(ps => ps.participantId === participant.id)) {
                      return null;
                    }

                    return (
                      <Box
                        key={participant.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                          p: 1,
                          borderRadius: "0.5rem",
                          bgcolor: participant.isHost ? "rgba(255, 165, 0, 0.1)" : "transparent",
                        }}
                      >
                        <Avatar
                          src={participant.avatarUrl || undefined}
                          alt={participant.name || "User"}
                          sx={{ mr: 2 }}
                        >
                          {!participant.avatarUrl && avatarFallback}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">
                            {participant.name || "Unnamed User"} {participant.isHost && "(Host)"}
                          </Typography>
                          {sessionStarted && (
                            <Typography variant="h6" color="primary">
                              {participant.count} reps
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No participants yet
                </Typography>
              )}
            </Box>
            
            {sessionStarted && (
              <Box sx={{ mt: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  How to do Bicep Curls
                </Typography>
                <Box sx={{ width: '100%', textAlign: 'center', mb: 2 }}>
                  <img src="/Assets/bicep.gif" style={{ maxWidth: '100%' }} alt="Biceps Curls" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  1. Stand with your arms extended down
                  2. Curl your arms up towards your shoulders
                  3. Lower your arms back down
                  4. Repeat for maximum gains!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MultiplayerBicepCurls;