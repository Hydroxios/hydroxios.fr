"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type TraceSegment = {
  from: THREE.Vector3;
  to: THREE.Vector3;
  length: number;
  startDistance: number;
  endDistance: number;
};

type TracePath = {
  segments: TraceSegment[];
  length: number;
};

const TRACE_COUNT = 72;
const PULSE_COUNT = 24;
const STREAK_SEGMENTS_PER_PULSE = 3;
const STREAK_LENGTH = 0.72;
const RESTART_GAP = 1.4;
const HIDDEN_POSITION = 1000;
const BOARD_WIDTH = 38;
const BOARD_HEIGHT = 24;

function seededRandom(seed: number) {
  let value = seed;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function snap(value: number) {
  return Math.round(value * 2) / 2;
}

function createPcbGeometry() {
  const random = seededRandom(8067);
  const tracePositions: number[] = [];
  const padPositions: number[] = [];
  const paths: TracePath[] = [];

  for (let index = 0; index < TRACE_COUNT; index += 1) {
    const x = snap((random() - 0.5) * BOARD_WIDTH);
    const y = snap((random() - 0.5) * BOARD_HEIGHT);
    const horizontalFirst = random() > 0.5;
    const longStep = snap((random() * 5 + 2.5) * (random() > 0.5 ? 1 : -1));
    const shortStep = snap((random() * 3 + 1) * (random() > 0.5 ? 1 : -1));

    const start = new THREE.Vector3(x, y, 0);
    const corner = horizontalFirst
      ? new THREE.Vector3(THREE.MathUtils.clamp(x + longStep, -BOARD_WIDTH / 2, BOARD_WIDTH / 2), y, 0)
      : new THREE.Vector3(x, THREE.MathUtils.clamp(y + longStep, -BOARD_HEIGHT / 2, BOARD_HEIGHT / 2), 0);
    const end = horizontalFirst
      ? new THREE.Vector3(corner.x, THREE.MathUtils.clamp(y + shortStep, -BOARD_HEIGHT / 2, BOARD_HEIGHT / 2), 0)
      : new THREE.Vector3(THREE.MathUtils.clamp(x + shortStep, -BOARD_WIDTH / 2, BOARD_WIDTH / 2), corner.y, 0);

    const chamfer = Math.min(0.7, Math.abs(longStep) / 3, Math.abs(shortStep) / 3);
    const beforeCorner = horizontalFirst
      ? new THREE.Vector3(corner.x - Math.sign(longStep) * chamfer, corner.y, 0)
      : new THREE.Vector3(corner.x, corner.y - Math.sign(longStep) * chamfer, 0);
    const afterCorner = horizontalFirst
      ? new THREE.Vector3(corner.x, corner.y + Math.sign(shortStep) * chamfer, 0)
      : new THREE.Vector3(corner.x + Math.sign(shortStep) * chamfer, corner.y, 0);

    const segments = [
      [start, beforeCorner],
      [beforeCorner, afterCorner],
      [afterCorner, end],
    ] as const;

    const pathSegments: TraceSegment[] = [];
    let pathLength = 0;

    for (const [from, to] of segments) {
      const length = from.distanceTo(to);

      if (length < 0.3) {
        continue;
      }

      tracePositions.push(from.x, from.y, from.z, to.x, to.y, to.z);
      pathSegments.push({
        from,
        to,
        length,
        startDistance: pathLength,
        endDistance: pathLength + length,
      });
      pathLength += length;
    }

    if (pathSegments.length > 0) {
      paths.push({ segments: pathSegments, length: pathLength });
    }

    if (index % 2 === 0) {
      padPositions.push(start.x, start.y, 0.03, end.x, end.y, 0.03);
    } else {
      padPositions.push(end.x, end.y, 0.03);
    }
  }

  return {
    tracePositions: new Float32Array(tracePositions),
    padPositions: new Float32Array(padPositions),
    paths,
  };
}

export default function PcbBackground() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.width = "100%";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -20, 20);
    camera.position.set(0, 0, 10);

    const board = new THREE.Group();
    board.rotation.z = -0.06;
    scene.add(board);

    const { tracePositions, padPositions, paths } = createPcbGeometry();

    const tracesGeometry = new THREE.BufferGeometry();
    tracesGeometry.setAttribute("position", new THREE.BufferAttribute(tracePositions, 3));
    const tracesMaterial = new THREE.LineBasicMaterial({
      color: 0x9bdad3,
      transparent: true,
      opacity: 0.3,
    });
    const lineSegments = new THREE.LineSegments(tracesGeometry, tracesMaterial);
    board.add(lineSegments);

    const padGeometry = new THREE.BufferGeometry();
    padGeometry.setAttribute("position", new THREE.BufferAttribute(padPositions, 3));
    const padMaterial = new THREE.PointsMaterial({
      color: 0xc2fff5,
      size: 0.13,
      transparent: true,
      opacity: 0.58,
      sizeAttenuation: true,
    });
    const pads = new THREE.Points(padGeometry, padMaterial);
    board.add(pads);

    const pulsePositions = new Float32Array(PULSE_COUNT * 3);
    const pulseGeometry = new THREE.BufferGeometry();
    pulseGeometry.setAttribute("position", new THREE.BufferAttribute(pulsePositions, 3));
    const pulseMaterial = new THREE.PointsMaterial({
      color: 0x6fffe9,
      size: 0.23,
      transparent: true,
      opacity: 0.82,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pulses = new THREE.Points(pulseGeometry, pulseMaterial);
    board.add(pulses);

    const streakPositions = new Float32Array(PULSE_COUNT * STREAK_SEGMENTS_PER_PULSE * 6);
    const streakGeometry = new THREE.BufferGeometry();
    streakGeometry.setAttribute("position", new THREE.BufferAttribute(streakPositions, 3));
    const streakMaterial = new THREE.LineBasicMaterial({
      color: 0x6fffe9,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const streaks = new THREE.LineSegments(streakGeometry, streakMaterial);
    board.add(streaks);

    const glowGeometry = tracesGeometry.clone();
    const glowMaterial = new THREE.LineBasicMaterial({
      color: 0x78d9cf,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.LineSegments(glowGeometry, glowMaterial);
    glow.scale.setScalar(1.002);
    board.add(glow);

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      const aspect = width / height;
      const viewHeight = 19;
      const viewWidth = viewHeight * aspect;

      camera.left = -viewWidth / 2;
      camera.right = viewWidth / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frameId = 0;
    let isRunning = false;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    const samplePath = (path: TracePath, distance: number) => {
      const clampedDistance = THREE.MathUtils.clamp(distance, 0, path.length);
      const segmentIndex = path.segments.findIndex((segment) => clampedDistance <= segment.endDistance);
      const resolvedIndex = segmentIndex === -1 ? path.segments.length - 1 : segmentIndex;
      const segment = path.segments[resolvedIndex];
      const segmentProgress = THREE.MathUtils.clamp(
        (clampedDistance - segment.startDistance) / segment.length,
        0,
        1,
      );

      return {
        x: THREE.MathUtils.lerp(segment.from.x, segment.to.x, segmentProgress),
        y: THREE.MathUtils.lerp(segment.from.y, segment.to.y, segmentProgress),
        segmentIndex: resolvedIndex,
      };
    };

    const updateScene = (time: number) => {
      const positions = pulseGeometry.attributes.position.array as Float32Array;
      const streaksArray = streakGeometry.attributes.position.array as Float32Array;

      for (let index = 0; index < PULSE_COUNT; index += 1) {
        const path = paths[(index * 7) % paths.length];
        const speed = 0.9 + (index % 6) * 0.12;
        const cycleLength = path.length + STREAK_LENGTH + RESTART_GAP;
        const travelDistance = (time * speed + index * 1.83) % cycleLength;
        const hasFullyExited = travelDistance > path.length + STREAK_LENGTH;

        if (hasFullyExited) {
          positions[index * 3] = HIDDEN_POSITION;
          positions[index * 3 + 1] = HIDDEN_POSITION;
          positions[index * 3 + 2] = 0.08;

          for (let streakIndex = 0; streakIndex < STREAK_SEGMENTS_PER_PULSE; streakIndex += 1) {
            const offset = (index * STREAK_SEGMENTS_PER_PULSE + streakIndex) * 6;

            streaksArray[offset] = HIDDEN_POSITION;
            streaksArray[offset + 1] = HIDDEN_POSITION;
            streaksArray[offset + 2] = 0.06;
            streaksArray[offset + 3] = HIDDEN_POSITION;
            streaksArray[offset + 4] = HIDDEN_POSITION;
            streaksArray[offset + 5] = 0.06;
          }

          continue;
        }

        const headDistance = Math.min(travelDistance, path.length);
        const tailDistance = THREE.MathUtils.clamp(travelDistance - STREAK_LENGTH, 0, path.length);
        const head = samplePath(path, headDistance);
        const tail = samplePath(path, tailDistance);
        const streakPoints = [{ x: tail.x, y: tail.y }];

        for (let segmentIndex = tail.segmentIndex; segmentIndex < head.segmentIndex; segmentIndex += 1) {
          const corner = path.segments[segmentIndex].to;
          streakPoints.push({ x: corner.x, y: corner.y });
        }

        streakPoints.push({ x: head.x, y: head.y });

        positions[index * 3] = head.x;
        positions[index * 3 + 1] = head.y;
        positions[index * 3 + 2] = 0.08;

        for (let streakIndex = 0; streakIndex < STREAK_SEGMENTS_PER_PULSE; streakIndex += 1) {
          const startPoint = streakPoints[Math.min(streakIndex, streakPoints.length - 1)];
          const endPoint = streakPoints[Math.min(streakIndex + 1, streakPoints.length - 1)];
          const offset = (index * STREAK_SEGMENTS_PER_PULSE + streakIndex) * 6;

          streaksArray[offset] = startPoint.x;
          streaksArray[offset + 1] = startPoint.y;
          streaksArray[offset + 2] = 0.06;
          streaksArray[offset + 3] = endPoint.x;
          streaksArray[offset + 4] = endPoint.y;
          streaksArray[offset + 5] = 0.06;
        }
      }

      pulseGeometry.attributes.position.needsUpdate = true;
      streakGeometry.attributes.position.needsUpdate = true;
      board.position.x = Math.sin(time * 0.16) * 0.25;
      board.position.y = Math.cos(time * 0.13) * 0.18;
      board.rotation.z = -0.06 + Math.sin(time * 0.09) * 0.012;
      tracesMaterial.opacity = 0.27 + Math.sin(time * 0.65) * 0.035;
      glowMaterial.opacity = 0.07 + Math.sin(time * 0.8) * 0.018;
      streakMaterial.opacity = 0.6 + Math.sin(time * 1.4) * 0.1;
      padMaterial.opacity = 0.5 + Math.sin(time * 0.75) * 0.06;

      renderer.render(scene, camera);
    };

    const animate = () => {
      if (!isRunning) {
        return;
      }

      updateScene(performance.now() * 0.001);
      frameId = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      isRunning = false;
      cancelAnimationFrame(frameId);
    };

    const syncAnimation = () => {
      if (document.hidden || motionPreference.matches) {
        stopAnimation();
        updateScene(0);
        return;
      }

      if (!isRunning) {
        isRunning = true;
        frameId = requestAnimationFrame(animate);
      }
    };

    document.addEventListener("visibilitychange", syncAnimation);
    motionPreference.addEventListener("change", syncAnimation);
    syncAnimation();

    return () => {
      stopAnimation();
      document.removeEventListener("visibilitychange", syncAnimation);
      motionPreference.removeEventListener("change", syncAnimation);
      resizeObserver.disconnect();
      host.removeChild(renderer.domElement);

      tracesGeometry.dispose();
      glowGeometry.dispose();
      padGeometry.dispose();
      pulseGeometry.dispose();
      streakGeometry.dispose();
      tracesMaterial.dispose();
      glowMaterial.dispose();
      padMaterial.dispose();
      pulseMaterial.dispose();
      streakMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      data-pcb-background
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
    />
  );
}
