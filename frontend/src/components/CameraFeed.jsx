import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { Camera, CameraOff, ShieldCheck, ShieldAlert, Cpu } from "lucide-react";
import { apiService } from "../services/api";

export default function CameraFeed({ 
  isSimulating, 
  confidenceThreshold = 85,
  captureInterval = 5,
  cameraSelection = "default_cam",
  onDetectionChange 
}) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [confidence, setConfidence] = useState(98.4);
  const [detectedUser, setDetectedUser] = useState("Prajyesh (Admin)");
  const [trackingState, setTrackingState] = useState("SECURE"); // SECURE, SEARCHING, ALERT
  const [fps, setFps] = useState(30);
  const [inferenceTime, setInferenceTime] = useState(42);
  const [lastDetectionTime, setLastDetectionTime] = useState("Never");
  const [boxCoords, setBoxCoords] = useState({ top: "25%", left: "30%", width: "40%", height: "50%" });
  const [faceDetected, setFaceDetected] = useState(false);
  const [localConfidence, setLocalConfidence] = useState(98.4);

  // Debouncing / stabilization history buffer
  const detectionHistoryRef = useRef([]);
  const lastStableStateRef = useRef("PRESENT");

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    setLastDetectionTime(new Date().toLocaleTimeString());
  };

  const runAIDetection = async () => {
    if (!isCameraOn) return;

    let base64Frame = null;
    if (webcamRef.current) {
      try {
        base64Frame = webcamRef.current.getScreenshot();
      } catch (err) {
        console.warn("[Camera] Failed to capture webcam screenshot.", err);
      }
    }

    setLastDetectionTime(new Date().toLocaleTimeString());

    try {
      const res = await apiService.uploadFaceFrame(base64Frame);
      if (res && res.data) {
        const detection = res.data;
        setInferenceTime(detection.inferenceTimeMs || 42);
      }
    } catch (err) {
      console.error("[Camera] AI Detection background error:", err);
    }
  };

  // Real-time MediaPipe face tracking loop
  useEffect(() => {
    if (!isCameraOn) {
      setFaceDetected(false);
      setConfidence(0);
      setLocalConfidence(0);
      return;
    }

    let faceDetection = null;
    let active = true;
    let checkInterval = null;

    const initFaceDetection = () => {
      if (!window.FaceDetection) return false;

      try {
        faceDetection = new window.FaceDetection({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
        });

        faceDetection.setOptions({
          model: 'short',
          minDetectionConfidence: 0.65
        });

        faceDetection.onResults((results) => {
          if (!active) return;

          if (results.detections && results.detections.length > 0) {
            // Track the largest face
            let targetDetection = results.detections[0];
            if (results.detections.length > 1) {
              let maxArea = -1;
              results.detections.forEach((det) => {
                const area = det.boundingBox.width * det.boundingBox.height;
                if (area > maxArea) {
                  maxArea = area;
                  targetDetection = det;
                }
              });
            }

            const bbox = targetDetection.boundingBox;
            const x = bbox.xCenter - bbox.width / 2;
            const y = bbox.yCenter - bbox.height / 2;
            const w = bbox.width;
            const h = bbox.height;

            // Smooth tracking coordinates using LERP to prevent jitter
            setBoxCoords((prev) => {
              const targetLeft = x * 100;
              const targetTop = y * 100;
              const targetWidth = w * 100;
              const targetHeight = h * 100;

              const prevLeft = parseFloat(prev.left) || targetLeft;
              const prevTop = parseFloat(prev.top) || targetTop;
              const prevWidth = parseFloat(prev.width) || targetWidth;
              const prevHeight = parseFloat(prev.height) || targetHeight;

              const smoothLeft = prevLeft + 0.3 * (targetLeft - prevLeft);
              const smoothTop = prevTop + 0.3 * (targetTop - prevTop);
              const smoothWidth = prevWidth + 0.3 * (targetWidth - prevWidth);
              const smoothHeight = prevHeight + 0.3 * (targetHeight - prevHeight);

              return {
                left: `${smoothLeft.toFixed(1)}%`,
                top: `${smoothTop.toFixed(1)}%`,
                width: `${smoothWidth.toFixed(1)}%`,
                height: `${smoothHeight.toFixed(1)}%`
              };
            });

            setFaceDetected(true);
            const score = Math.round(targetDetection.score[0] * 100);
            setLocalConfidence(score);
            setConfidence(score);

            if (results.detections.length > 1) {
              setTrackingState("ALERT");
              setDetectedUser("MULTIPLE PERSONS DETECTED");
              onDetectionChange({
                status: "Multiple Persons",
                confidence: score,
                label: "Multiple Entities"
              });
            } else {
              setTrackingState("SECURE");
              setDetectedUser("Authorized User");
              onDetectionChange({
                status: "Present",
                confidence: score,
                label: "Authorized User"
              });
            }
          } else {
            setFaceDetected(false);
            setLocalConfidence(0);
            setConfidence(0);

            onDetectionChange({
              status: "Absent",
              confidence: 0,
              label: "None"
            });
          }
        });

        // Frame capture loop
        const trackFrame = async () => {
          if (!active || !isCameraOn) return;

          const video = webcamRef.current?.video;
          if (video && video.readyState === 4) {
            try {
              await faceDetection.send({ image: video });
            } catch (err) {
              console.warn("[MediaPipe] send frame error:", err);
            }
          }

          setTimeout(() => {
            if (active) requestAnimationFrame(trackFrame);
          }, 33);
        };

        // Let the video warm up
        setTimeout(() => {
          if (active) trackFrame();
        }, 800);

        return true;
      } catch (err) {
        console.error("[Camera] MediaPipe Face Detection initialization failed:", err);
        return false;
      }
    };

    const success = initFaceDetection();
    if (!success) {
      // Retry every 500ms until window.FaceDetection becomes available
      checkInterval = setInterval(() => {
        if (initFaceDetection()) {
          clearInterval(checkInterval);
        }
      }, 500);
    }

    return () => {
      active = false;
      if (checkInterval) clearInterval(checkInterval);
      if (faceDetection) {
        try {
          faceDetection.close();
        } catch (e) {}
      }
    };
  }, [isCameraOn]);

  // Background uploader loop to trigger DB logs/locks
  useEffect(() => {
    if (!isCameraOn) return;

    runAIDetection();

    const scanInterval = setInterval(() => {
      runAIDetection();
    }, captureInterval * 1000);

    return () => clearInterval(scanInterval);
  }, [isCameraOn, captureInterval]);

  useEffect(() => {
    const fpsTimer = setInterval(() => {
      if (isCameraOn) {
        setFps(Math.round(29 + Math.random() * 2));
      }
    }, 2000);
    return () => clearInterval(fpsTimer);
  }, [isCameraOn]);

  // Canvas drawing loop
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Matrix grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx.lineWidth = 0.5;
      const grid = 25;
      for (let x = 0; x < w; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Circles
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 85, 0, Math.PI * 2);
      ctx.stroke();



      // Mock face wire frame (extremely clean, 0.5px lines)
      if (!isCameraOn) {
        ctx.fillStyle = trackingState === "ALERT" ? "rgba(239, 68, 68, 0.35)" : "rgba(99, 102, 241, 0.35)";
        const faceNodes = [
          { x: w / 2, y: h / 2 - 35 },
          { x: w / 2 - 25, y: h / 2 - 15 },
          { x: w / 2 + 25, y: h / 2 - 15 },
          { x: w / 2 - 15, y: h / 2 },
          { x: w / 2 + 15, y: h / 2 },
          { x: w / 2, y: h / 2 + 10 },
          { x: w / 2 - 20, y: h / 2 + 25 },
          { x: w / 2 + 20, y: h / 2 + 25 },
          { x: w / 2, y: h / 2 + 40 },
        ];

        ctx.strokeStyle = trackingState === "ALERT" ? "rgba(239, 68, 68, 0.08)" : "rgba(99, 102, 241, 0.08)";
        ctx.lineWidth = 0.5;
        faceNodes.forEach((node, i) => {
          faceNodes.forEach((other, j) => {
            if (i !== j && Math.abs(i - j) <= 2) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          });
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }


      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [isCameraOn, trackingState]);

  return (
    <div className="relative overflow-hidden rounded-xl glass-panel p-1 shadow-xl min-h-[380px] flex flex-col justify-between">
      
      {/* Screen Stream Frame */}
      <div className="relative flex-grow rounded-lg bg-slate-950/90 overflow-hidden min-h-[300px]">
        {isCameraOn ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover min-h-[300px]"
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user"
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-radial-gradient from-slate-900 to-slate-950">
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="w-full h-full max-h-[480px] object-cover"
            />
          </div>
        )}

        {/* Scanning laser line overlay */}


        {/* Face Bounding Box (refined to 1px) */}
        {isCameraOn && faceDetected && (
          <motion.div
            style={{
              position: "absolute",
              top: boxCoords.top,
              left: boxCoords.left,
              width: boxCoords.width,
              height: boxCoords.height
            }}
            animate={{
              borderColor: trackingState === "ALERT" ? "#f43f5e" : "#10b981",
              boxShadow: trackingState === "ALERT" ? "0 0 10px rgba(244, 63, 94, 0.25)" : "0 0 10px rgba(16, 185, 129, 0.25)"
            }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
            className="border rounded pointer-events-none flex flex-col justify-between p-1.5"
          >
            <div className="flex justify-between">
              <span className={`w-2 h-2 border-t border-l ${trackingState === "ALERT" ? "border-rose-500" : "border-emerald-400"}`} />
              <span className={`w-2 h-2 border-t border-r ${trackingState === "ALERT" ? "border-rose-500" : "border-emerald-400"}`} />
            </div>

            <div className="flex justify-between">
              <span className={`w-2 h-2 border-b border-l ${trackingState === "ALERT" ? "border-rose-500" : "border-emerald-400"}`} />
              <span className={`w-2 h-2 border-b border-r ${trackingState === "ALERT" ? "border-rose-500" : "border-emerald-400"}`} />
            </div>
          </motion.div>
        )}

        {/* Top telemetry badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 rounded bg-slate-950/95 border border-slate-900 px-2 py-0.5 text-[8.5px] font-bold text-slate-350">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${isCameraOn ? "bg-rose-400" : "bg-indigo-400"}`}></span>
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isCameraOn ? "bg-rose-500" : "bg-indigo-500"}`}></span>
            </span>
            <span>{isCameraOn ? "LIVE" : "STANDBY"}</span>
          </div>

          <div className="flex items-center gap-1 rounded bg-slate-950/95 border border-slate-900 px-2 py-0.5 text-[8.5px] font-bold text-indigo-400">
            <Cpu className="h-3 w-3" />
            <span>AI SCANNER</span>
          </div>
        </div>

        {/* Bottom statistics panel */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between pointer-events-none text-[8px] font-mono text-slate-500">
          <div className="flex flex-col bg-slate-950/90 border border-slate-900 rounded p-1 gap-0.5">
            <div>RESOLVE: 640x480</div>
            <div>INF: {inferenceTime}ms</div>
            <div>FPS: {isCameraOn ? fps : 0}</div>
          </div>
          
          <div className="flex flex-col bg-slate-950/90 border border-slate-900 rounded p-1 text-right gap-0.5">
            <div>CONFIDENCE: {Math.round(confidence)}%</div>
            <div>CLEARANCE: L1</div>
            <div>LAST: {lastDetectionTime}</div>
          </div>
        </div>
      </div>

      {/* Camera controls */}
      <div className="mt-2.5 flex items-center justify-between px-2 pb-1.5 pt-0.5 gap-2">
        <button
          onClick={toggleCamera}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            isCameraOn
              ? "bg-slate-900 border-slate-800 text-rose-450 hover:bg-slate-850"
              : "bg-indigo-950/20 border-indigo-900/30 text-indigo-400 hover:bg-indigo-950/40"
          }`}
        >
          {isCameraOn ? (
            <>
              <CameraOff className="h-3.5 w-3.5" />
              <span>Disable Webcam</span>
            </>
          ) : (
            <>
              <Camera className="h-3.5 w-3.5" />
              <span>Activate Webcam</span>
            </>
          )}
        </button>


      </div>

    </div>
  );
}
