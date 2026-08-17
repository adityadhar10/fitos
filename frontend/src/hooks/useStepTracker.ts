import { useState, useEffect, useRef, useCallback } from "react";
import { updateTodayMetrics } from "../services/api";

interface StepTrackerState {
  isTracking: boolean;
  isSupported: boolean;
  liveSteps: number;
  cadence: number;
  distanceKm: number;
  caloriesBurned: number;
  motionIntensity: number; // 0 to 1 live signal strength
  error: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  recordStep: () => void;
  addManualSteps: (count: number) => void;
  syncNow: () => Promise<void>;
}

export function useStepTracker(initialSteps: number, onStepsUpdate?: (newSteps: number) => void): StepTrackerState {
  const [isTracking, setIsTracking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [liveSteps, setLiveSteps] = useState(initialSteps);
  const [cadence, setCadence] = useState(0);
  const [motionIntensity, setMotionIntensity] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stepsRef = useRef(initialSteps);
  stepsRef.current = liveSteps;

  const lastStepTimeRef = useRef<number>(0);
  const recentStepTimesRef = useRef<number[]>([]);
  const lastSyncStepsRef = useRef<number>(initialSteps);
  const wakeLockRef = useRef<any>(null);

  // Digital Signal Processing state
  const gravityBaselineRef = useRef<number>(9.8);
  const filteredDeltaRef = useRef<number>(0);
  const stateMachineRef = useRef<"WAIT_PEAK" | "WAIT_VALLEY">("WAIT_PEAK");
  const peakValueRef = useRef<number>(0);

  // Synchronize when initialSteps is updated from server
  useEffect(() => {
    if (!isTracking && initialSteps > 0 && liveSteps === 0) {
      setLiveSteps(initialSteps);
      lastSyncStepsRef.current = initialSteps;
    }
  }, [initialSteps, isTracking, liveSteps]);

  // Sync steps to backend (debounced)
  const syncToBackend = useCallback(async (currentCount: number) => {
    if (currentCount === lastSyncStepsRef.current) return;
    try {
      await updateTodayMetrics(currentCount);
      lastSyncStepsRef.current = currentCount;
      if (onStepsUpdate) onStepsUpdate(currentCount);
    } catch (err) {
      console.warn("Failed to auto-sync steps to backend:", err);
    }
  }, [onStepsUpdate]);

  const recordStep = useCallback(() => {
    const now = Date.now();
    lastStepTimeRef.current = now;

    setLiveSteps((prev) => {
      const next = prev + 1;
      if (next % 10 === 0) syncToBackend(next);
      return next;
    });

    recentStepTimesRef.current.push(now);
    recentStepTimesRef.current = recentStepTimesRef.current.filter((t) => now - t <= 8000);
    if (recentStepTimesRef.current.length >= 2) {
      const spanSec = (now - recentStepTimesRef.current[0]) / 1000;
      if (spanSec > 0) {
        const spm = Math.round((recentStepTimesRef.current.length / spanSec) * 60);
        setCadence(spm);
      }
    }
  }, [syncToBackend]);

  // High-precision step detection filter
  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    let delta = 0;
    const linAcc = event.acceleration;

    if (linAcc && linAcc.x !== null && linAcc.y !== null && linAcc.z !== null && (linAcc.x !== 0 || linAcc.y !== 0 || linAcc.z !== 0)) {
      const lx = linAcc.x || 0;
      const ly = linAcc.y || 0;
      const lz = linAcc.z || 0;
      delta = Math.sqrt(lx * lx + ly * ly + lz * lz);
    } else {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;
      const rawMag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      gravityBaselineRef.current = 0.96 * gravityBaselineRef.current + 0.04 * rawMag;
      delta = Math.abs(rawMag - gravityBaselineRef.current);
    }

    filteredDeltaRef.current = 0.65 * filteredDeltaRef.current + 0.35 * delta;
    const currentDelta = filteredDeltaRef.current;
    setMotionIntensity(Math.min(1, currentDelta / 3.5));
    const now = Date.now();

    // Balanced human walking thresholds (1.8 m/s^2 peak, 0.7 m/s^2 valley)
    const PEAK_THRESHOLD = 1.8;   // m/s^2
    const VALLEY_THRESHOLD = 0.7; // m/s^2
    const MIN_STEP_TIME = 280;    // ms (max 214 steps/min)
    const MAX_STEP_TIME = 2000;   // ms

    if (stateMachineRef.current === "WAIT_PEAK") {
      if (currentDelta > PEAK_THRESHOLD) {
        peakValueRef.current = currentDelta;
        stateMachineRef.current = "WAIT_VALLEY";
      }
    } else if (stateMachineRef.current === "WAIT_VALLEY") {
      if (currentDelta > peakValueRef.current) {
        peakValueRef.current = currentDelta;
      } else if (currentDelta < VALLEY_THRESHOLD) {
        const timeSinceLastStep = now - lastStepTimeRef.current;

        if (timeSinceLastStep >= MIN_STEP_TIME && timeSinceLastStep <= MAX_STEP_TIME) {
          recordStep();
        } else if (timeSinceLastStep > MAX_STEP_TIME) {
          lastStepTimeRef.current = now;
          recentStepTimesRef.current = [now];
          setLiveSteps((prev) => prev + 1);
        }

        stateMachineRef.current = "WAIT_PEAK";
      }
    }
  }, [recordStep]);

  // Request sensor permissions (iOS & Android)
  const startTracking = async () => {
    setError(null);

    if (typeof (DeviceMotionEvent as any)?.requestPermission === "function") {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== "granted") {
          setError("Motion sensor permission was not granted. Please allow accelerometer access in your browser settings.");
          return;
        }
      } catch (err: any) {
        setError("Could not request motion sensor: " + err.message);
        return;
      }
    }

    if (!window.DeviceMotionEvent) {
      setIsSupported(false);
      setError("Device motion sensors not supported on this device/browser.");
      return;
    }

    if ("wakeLock" in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      } catch {}
    }

    stateMachineRef.current = "WAIT_PEAK";
    window.addEventListener("devicemotion", handleMotion, true);
    setIsTracking(true);
  };

  const stopTracking = () => {
    window.removeEventListener("devicemotion", handleMotion, true);
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release();
      } catch {}
      wakeLockRef.current = null;
    }
    setIsTracking(false);
    setCadence(0);
    setMotionIntensity(0);
    syncToBackend(stepsRef.current);
  };

  const addManualSteps = (count: number) => {
    setLiveSteps((prev) => {
      const next = prev + count;
      syncToBackend(next);
      return next;
    });
  };

  const syncNow = async () => {
    await syncToBackend(stepsRef.current);
  };

  const distanceKm = Number((liveSteps * 0.00078).toFixed(2));
  const caloriesBurned = Math.round(liveSteps * 0.04);

  return {
    isTracking,
    isSupported,
    liveSteps,
    cadence,
    distanceKm,
    caloriesBurned,
    motionIntensity,
    error,
    startTracking,
    stopTracking,
    recordStep,
    addManualSteps,
    syncNow,
  };
}
