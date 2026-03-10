
import React from "react";
import type { SimulationParams } from "./ThreadSimulation";

interface ControlPanelProps {
  params: SimulationParams;
  onParamsChange: (newParams: SimulationParams) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  onResolutionChange: (resolution: { width: number; height: number }) => void;
  downloadUrl: string | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  onParamsChange,
  onStartRecording,
  onStopRecording,
  isRecording,
  onResolutionChange,
  downloadUrl,
}) => {
  const handleParamChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    onParamsChange({ ...params, [name]: Number(value) });
  };

  return (
    <div className="absolute left-4 top-4 z-10 w-96 rounded-lg bg-[#1a1a1a]/80 p-4 text-white backdrop-blur-md">
      <h2 className="mb-4 text-2xl font-bold">Recording Studio</h2>
      <div className="space-y-4">
        {Object.entries(params).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <label htmlFor={key} className="text-sm capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                id={key}
                name={key}
                min={getMin(key)}
                max={getMax(key)}
                step={getStep(key)}
                value={value}
                onChange={handleParamChange}
                className="w-32"
              />
              <input
                type="number"
                name={key}
                value={value}
                onChange={handleParamChange}
                className="w-20 rounded bg-[#2a2a2a] p-1 text-center"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <h3 className="mb-2 text-lg font-semibold">Recording</h3>
        <div className="flex items-center justify-between">
          <label htmlFor="resolution" className="text-sm">
            Resolution
          </label>
          <select
            id="resolution"
            onChange={(e) => {
              const [width, height] = e.target.value.split("x").map(Number);
              onResolutionChange({ width, height });
            }}
            className="rounded bg-[#2a2a2a] p-1"
          >
            <option value="1280x720">720p</option>
            <option value="1920x1080">1080p</option>
            <option value="2560x1440">1440p</option>
            <option value="3840x2160">4K</option>
          </select>
        </div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={onStartRecording}
            disabled={isRecording}
            className="flex flex-1 items-center justify-center gap-2 rounded bg-green-600 px-4 py-2 font-bold text-white transition-colors hover:bg-green-700 disabled:bg-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" fill="red" stroke="red" />
            </svg>
            Record
          </button>
          <button
            onClick={onStopRecording}
            disabled={!isRecording}
            className="flex flex-1 items-center justify-center gap-2 rounded bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700 disabled:bg-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="6" y="6" width="12" height="12" />
            </svg>
            Stop
          </button>
        </div>
        {downloadUrl && (
          <div className="mt-4">
            <a
              href={downloadUrl}
              download="thread-simulation.webm"
              className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;

const getMin = (key: string) => {
  switch (key) {
    case "threadCount":
      return 1;
    case "minSegments":
      return 1;
    case "segmentCount":
      return 1;
    case "segmentLength":
      return 1;
    case "followForce":
      return 0.1;
    case "damping":
      return 0.1;
    case "maxSpeed":
      return 1;
    case "constraintIterations":
      return 1;
    case "bundleRadius":
      return 1;
    case "spreadSensitivity":
      return 1;
    default:
      return 0;
  }
};

const getMax = (key: string) => {
  switch (key) {
    case "threadCount":
      return 1000;
    case "minSegments":
      return 50;
    case "segmentCount":
      return 200;
    case "segmentLength":
      return 50;
    case "followForce":
      return 10;
    case "damping":
      return 1;
    case "maxSpeed":
      return 200;
    case "constraintIterations":
      return 50;
    case "bundleRadius":
      return 200;
    case "spreadSensitivity":
      return 50;
    default:
      return 100;
  }
};

const getStep = (key: string) => {
  switch (key) {
    case "followForce":
      return 0.1;
    case "damping":
      return 0.01;
    default:
      return 1;
  }
};
