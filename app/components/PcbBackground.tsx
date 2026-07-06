"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Trace = {
  from: THREE.Vector3;
  to: THREE.Vector3;
  length: number;
};

const TRACE_COUNT = 86;
const PULSE_COUNT = 36;
const BOARD_WIDTH = 34;
const BOARD_HEIGHT = 22;

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
  const traces: Trace[] = [];

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

    const segments = [
      [start, corner],
      [corner, end],
    ] as const;

    for (const [from, to] of segments) {
      const length = from.distanceTo(to);

      if (length < 0.3) {
        continue;
      }

      tracePositions.push(from.x, from.y, from.z, to.x, to.y, to.z);
      traces.push({ from, to, length });
    }

    if (index % 2 === 0) {
      padPositions.push(start.x, start.y, 0.03, end.x, end.y, 0.03);
    } else {
      padPositions.push(corner.x, corner.y, 0.03);
    }
  }

  return {
    tracePositions: new Float32Array(tracePositions),
    padPositions: new Float32Array(padPositions),
    traces,
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.width = "100%";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -20, 20);
    camera.position.set(0, 0, 10);

    const board = new THREE.Group();
    board.rotation.z = -0.12;
    scene.add(board);

    const { tracePositions, padPositions, traces } = createPcbGeometry();

    const tracesGeometry = new THREE.BufferGeometry();
    tracesGeometry.setAttribute("position", new THREE.BufferAttribute(tracePositions, 3));
    const tracesMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.56,
    });
    const lineSegments = new THREE.LineSegments(tracesGeometry, tracesMaterial);
    board.add(lineSegments);

    const padGeometry = new THREE.BufferGeometry();
    padGeometry.setAttribute("position", new THREE.BufferAttribute(padPositions, 3));
    const padMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.72,
      sizeAttenuation: true,
    });
    const pads = new THREE.Points(padGeometry, padMaterial);
    board.add(pads);

    const pulsePositions = new Float32Array(PULSE_COUNT * 3);
    const pulseGeometry = new THREE.BufferGeometry();
    pulseGeometry.setAttribute("position", new THREE.BufferAttribute(pulsePositions, 3));
    const pulseMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.34,
      transparent: true,
      opacity: 0.92,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pulses = new THREE.Points(pulseGeometry, pulseMaterial);
    board.add(pulses);

    const streakPositions = new Float32Array(PULSE_COUNT * 6);
    const streakGeometry = new THREE.BufferGeometry();
    streakGeometry.setAttribute("position", new THREE.BufferAttribute(streakPositions, 3));
    const streakMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const streaks = new THREE.LineSegments(streakGeometry, streakMaterial);
    board.add(streaks);

    const glowGeometry = tracesGeometry.clone();
    const glowMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16,
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
      const viewHeight = 17;
      const viewWidth = viewHeight * aspect;

      camera.left = -viewWidth / 2;
      camera.right = viewWidth / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frameId = 0;
    const animate = () => {
      const time = performance.now() * 0.001;
      const positions = pulseGeometry.attributes.position.array as Float32Array;
      const streaksArray = streakGeometry.attributes.position.array as Float32Array;

      for (let index = 0; index < PULSE_COUNT; index += 1) {
        const trace = traces[(index * 7) % traces.length];
        const speed = 0.22 + (index % 6) * 0.045;
        const progress = (time * speed + index * 0.137) % 1;
        const tail = Math.min(0.32 / trace.length, 0.42);
        const startProgress = Math.max(progress - tail, 0);
        const point = trace.from.clone().lerp(trace.to, progress);
        const streakStart = trace.from.clone().lerp(trace.to, startProgress);

        positions[index * 3] = point.x;
        positions[index * 3 + 1] = point.y;
        positions[index * 3 + 2] = 0.08;

        streaksArray[index * 6] = streakStart.x;
        streaksArray[index * 6 + 1] = streakStart.y;
        streaksArray[index * 6 + 2] = 0.06;
        streaksArray[index * 6 + 3] = point.x;
        streaksArray[index * 6 + 4] = point.y;
        streaksArray[index * 6 + 5] = 0.06;
      }

      pulseGeometry.attributes.position.needsUpdate = true;
      streakGeometry.attributes.position.needsUpdate = true;
      board.position.x = Math.sin(time * 0.22) * 0.45;
      board.position.y = Math.cos(time * 0.18) * 0.28;
      board.rotation.z = -0.12 + Math.sin(time * 0.12) * 0.025;
      tracesMaterial.opacity = 0.48 + Math.sin(time * 0.85) * 0.08;
      glowMaterial.opacity = 0.14 + Math.sin(time * 1.4) * 0.045;
      streakMaterial.opacity = 0.74 + Math.sin(time * 2.1) * 0.14;
      padMaterial.opacity = 0.62 + Math.sin(time * 1.15) * 0.1;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
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
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black"
    />
  );
}
