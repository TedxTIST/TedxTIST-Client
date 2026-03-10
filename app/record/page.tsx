
"use client";
import React, {
  Suspense,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import ControlPanel from "../components/ControlPanel";
import type { SimulationParams } from "../components/ThreadSimulation";

const ThreadSimulation = dynamic(
  () => import("../components/ThreadSimulation"),
  {
    ssr: false,
  },
);

const RecordPage: NextPage = () => {
  const [params, setParams] = useState<SimulationParams>({
    threadCount: 360,
    minSegments: 8,
    segmentCount: 150,
    segmentLength: 15,
    followForce: 2,
    damping: 0.84,
    maxSpeed: 100,
    constraintIterations: 20,
    bundleRadius: 60,
    spreadSensitivity: 12,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [resolution, setResolution] = useState({ width: 1280, height: 720 });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleParamsChange = (newParams: SimulationParams) => {
    setParams(newParams);
  };

  const handleResolutionChange = (newResolution: {
    width: number;
    height: number;
  }) => {
    setResolution(newResolution);
  };

  const startRecordingAnimation = useCallback(() => {
    if (!canvasRef.current || !recordingCanvasRef.current) {
      return;
    }
    const sourceCanvas = canvasRef.current;
    const recordingCanvas = recordingCanvasRef.current;
    const recordingCtx = recordingCanvas.getContext("2d");

    if (!recordingCtx) return;

    const record = () => {
      const { width, height } = resolution;
      const devicePixelRatio = window.devicePixelRatio;
      const sourceX = (sourceCanvas.width / devicePixelRatio - width) / 2;
      const sourceY = (sourceCanvas.height / devicePixelRatio - height) / 2;
      recordingCtx.clearRect(0, 0, width, height);
      recordingCtx.drawImage(
        sourceCanvas,
        sourceX * devicePixelRatio,
        sourceY * devicePixelRatio,
        width * devicePixelRatio,
        height * devicePixelRatio,
        0,
        0,
        width,
        height,
      );
      animationFrameRef.current = requestAnimationFrame(record);
    };

    record();
  }, [resolution]);

  const handleStartRecording = () => {
    if (!canvasRef.current) return;
    setIsRecording(true);
    setDownloadUrl(null);
    recordedChunksRef.current = [];

    const recordingCanvas = document.createElement("canvas");
    recordingCanvas.width = resolution.width;
    recordingCanvas.height = resolution.height;
    recordingCanvasRef.current = recordingCanvas;

    const stream = recordingCanvas.captureStream();
    const options = { mimeType: "video/webm; codecs=vp9" };
    mediaRecorderRef.current = new MediaRecorder(stream, options);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.start();
  };

  useEffect(() => {
    if (isRecording) {
      startRecordingAnimation();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, startRecordingAnimation]);

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setTimeout(() => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      }, 100);
    }
  };
  return (
    <Suspense fallback={<div className="bg-black text-white">Loading...</div>}>
      <div className="h-screen bg-black">
        <ControlPanel
          params={params}
          onParamsChange={handleParamsChange}
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onResolutionChange={handleResolutionChange}
          downloadUrl={downloadUrl}
        />
        <ThreadSimulation
          ref={canvasRef}
          params={params}
          isRecording={isRecording}
          resolution={resolution}
        />
      </div>
    </Suspense>
  );
};
export default RecordPage;
