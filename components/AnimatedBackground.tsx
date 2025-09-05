"use client";

import { useState, useEffect } from "react";

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground = ({ className = "" }: AnimatedBackgroundProps) => {
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);

  // 10 different AI-themed background animations
  const animations = [
    {
      name: "neural-network",
      title: "Neural Network",
      component: <NeuralNetworkAnimation />,
    },
    {
      name: "data-streams",
      title: "Data Streams",
      component: <DataStreamsAnimation />,
    },
    {
      name: "matrix-rain",
      title: "Matrix Rain",
      component: <MatrixRainAnimation />,
    },
    {
      name: "quantum-particles",
      title: "Quantum Particles",
      component: <QuantumParticlesAnimation />,
    },
    {
      name: "holographic-grid",
      title: "Holographic Grid",
      component: <HolographicGridAnimation />,
    },
    {
      name: "circuit-board",
      title: "Circuit Board",
      component: <CircuitBoardAnimation />,
    },
    {
      name: "digital-waves",
      title: "Digital Waves",
      component: <DigitalWavesAnimation />,
    },
    {
      name: "cyber-city",
      title: "Cyber City",
      component: <CyberCityAnimation />,
    },
    {
      name: "data-matrix",
      title: "Data Matrix",
      component: <DataMatrixAnimation />,
    },
    {
      name: "ai-orbit",
      title: "AI Orbit",
      component: <AIOrbitAnimation />,
    },
  ];

  // Change animation every 15 seconds (15,000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimation((prev) => (prev + 1) % animations.length);
      setTimeLeft(15);
    }, 15 * 1000); // 15 seconds

    return () => clearInterval(interval);
  }, [animations.length]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 15));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentAnimation]);

  return (
    <div className={`fixed inset-0 -z-10 ${className}`} style={{ zIndex: -1 }}>
      {animations[currentAnimation].component}
    </div>
  );
};

// Animation 1: Neural Network
const NeuralNetworkAnimation = () => {
  // Use deterministic values to avoid hydration mismatch
  const nodePositions = [
    { left: 15, top: 20, delay: 0.5 },
    { left: 85, top: 15, delay: 1.2 },
    { left: 25, top: 60, delay: 0.8 },
    { left: 75, top: 45, delay: 1.5 },
    { left: 10, top: 80, delay: 0.3 },
    { left: 90, top: 70, delay: 2.1 },
    { left: 40, top: 30, delay: 0.9 },
    { left: 60, top: 85, delay: 1.8 },
    { left: 5, top: 40, delay: 0.6 },
    { left: 95, top: 25, delay: 1.3 },
    { left: 30, top: 10, delay: 0.4 },
    { left: 70, top: 55, delay: 1.7 },
    { left: 20, top: 90, delay: 0.7 },
    { left: 80, top: 35, delay: 1.4 },
    { left: 50, top: 5, delay: 0.2 },
    { left: 35, top: 75, delay: 1.6 },
    { left: 65, top: 15, delay: 0.9 },
    { left: 12, top: 50, delay: 1.1 },
    { left: 88, top: 60, delay: 1.9 },
    { left: 45, top: 95, delay: 0.8 },
  ];

  const connectionPositions = [
    { left: 20, top: 30, rotation: 45, delay: 0.5 },
    { left: 70, top: 25, rotation: 120, delay: 1.2 },
    { left: 15, top: 70, rotation: 200, delay: 0.8 },
    { left: 85, top: 60, rotation: 300, delay: 1.5 },
    { left: 30, top: 10, rotation: 90, delay: 0.3 },
    { left: 80, top: 80, rotation: 180, delay: 2.1 },
    { left: 50, top: 40, rotation: 270, delay: 0.9 },
    { left: 10, top: 50, rotation: 60, delay: 1.8 },
    { left: 90, top: 20, rotation: 150, delay: 0.6 },
    { left: 40, top: 90, rotation: 240, delay: 1.3 },
    { left: 60, top: 5, rotation: 30, delay: 0.4 },
    { left: 25, top: 85, rotation: 210, delay: 1.7 },
    { left: 75, top: 45, rotation: 330, delay: 0.7 },
    { left: 5, top: 35, rotation: 75, delay: 1.4 },
    { left: 95, top: 75, rotation: 165, delay: 0.2 },
  ];

  return (
    <div className="neural-network-bg">
      <div className="neural-nodes">
        {nodePositions.map((pos, i) => (
          <div
            key={i}
            className="neural-node"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              animationDelay: `${pos.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="neural-connections">
        {connectionPositions.map((pos, i) => (
          <div
            key={i}
            className="neural-connection"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: `rotate(${pos.rotation}deg)`,
              animationDelay: `${pos.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Animation 2: Data Streams
const DataStreamsAnimation = () => (
  <div className="data-streams-bg">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="data-stream"
        style={{
          left: `${i * 12.5 + 6.25}%`,
          animationDelay: `${i * 0.5}s`,
        }}
      >
        {Array.from({ length: 20 }).map((_, j) => (
          <div
            key={j}
            className="data-particle"
            style={{
              animationDelay: `${j * 0.1}s`,
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

// Animation 3: Matrix Rain
const MatrixRainAnimation = () => (
  <div className="matrix-rain-bg">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="matrix-column"
        style={{
          left: `${i * 8.33 + 4.16}%`,
          animationDelay: `${i * 0.3}s`,
        }}
      >
        {Array.from({ length: 30 }).map((_, j) => (
          <div
            key={j}
            className="matrix-char"
            style={{
              animationDelay: `${j * 0.1}s`,
            }}
          >
            {String.fromCharCode(0x30a0 + Math.random() * 96)}
          </div>
        ))}
      </div>
    ))}
  </div>
);

// Animation 4: Quantum Particles
const QuantumParticlesAnimation = () => {
  const particlePositions = [
    { left: 10, top: 20, delay: 0.5 },
    { left: 90, top: 15, delay: 1.2 },
    { left: 25, top: 60, delay: 0.8 },
    { left: 75, top: 45, delay: 1.5 },
    { left: 5, top: 80, delay: 0.3 },
    { left: 95, top: 70, delay: 2.1 },
    { left: 40, top: 30, delay: 0.9 },
    { left: 60, top: 85, delay: 1.8 },
    { left: 15, top: 40, delay: 0.6 },
    { left: 85, top: 25, delay: 1.3 },
    { left: 30, top: 10, delay: 0.4 },
    { left: 70, top: 55, delay: 1.7 },
    { left: 20, top: 90, delay: 0.7 },
    { left: 80, top: 35, delay: 1.4 },
    { left: 50, top: 5, delay: 0.2 },
    { left: 35, top: 75, delay: 1.6 },
    { left: 65, top: 15, delay: 0.9 },
    { left: 12, top: 50, delay: 1.1 },
    { left: 88, top: 60, delay: 1.9 },
    { left: 45, top: 95, delay: 0.8 },
    { left: 55, top: 12, delay: 1.4 },
    { left: 18, top: 65, delay: 0.6 },
    { left: 82, top: 38, delay: 1.2 },
    { left: 38, top: 88, delay: 0.9 },
    { left: 62, top: 22, delay: 1.7 },
  ];

  return (
    <div className="quantum-particles-bg">
      {particlePositions.map((pos, i) => (
        <div
          key={i}
          className="quantum-particle"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            animationDelay: `${pos.delay}s`,
          }}
        />
      ))}
      <div className="quantum-field">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="quantum-wave"
            style={{
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Animation 5: Holographic Grid
const HolographicGridAnimation = () => {
  const gridNodePositions = [
    { left: 20, top: 20, delay: 0.5 },
    { left: 80, top: 15, delay: 1.2 },
    { left: 25, top: 60, delay: 0.8 },
    { left: 75, top: 45, delay: 1.5 },
    { left: 10, top: 80, delay: 0.3 },
    { left: 90, top: 70, delay: 2.1 },
    { left: 40, top: 30, delay: 0.9 },
    { left: 60, top: 85, delay: 1.8 },
    { left: 15, top: 40, delay: 0.6 },
    { left: 85, top: 25, delay: 1.3 },
    { left: 30, top: 10, delay: 0.4 },
    { left: 70, top: 55, delay: 1.7 },
    { left: 50, top: 5, delay: 0.2 },
    { left: 35, top: 75, delay: 1.6 },
    { left: 65, top: 15, delay: 0.9 },
  ];

  return (
    <div className="holographic-grid-bg">
      <div className="grid-lines">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="grid-line horizontal"
            style={{
              top: `${i * 5}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="grid-line vertical"
            style={{
              left: `${i * 5}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <div className="grid-nodes">
        {gridNodePositions.map((pos, i) => (
          <div
            key={i}
            className="grid-node"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              animationDelay: `${pos.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Animation 6: Circuit Board
const CircuitBoardAnimation = () => {
  const circuitPathPositions = [
    { left: 20, top: 30, rotation: 45, delay: 0.5 },
    { left: 70, top: 25, rotation: 120, delay: 1.2 },
    { left: 15, top: 70, rotation: 200, delay: 0.8 },
    { left: 85, top: 60, rotation: 300, delay: 1.5 },
    { left: 30, top: 10, rotation: 90, delay: 0.3 },
    { left: 80, top: 80, rotation: 180, delay: 2.1 },
    { left: 50, top: 40, rotation: 270, delay: 0.9 },
    { left: 10, top: 50, rotation: 60, delay: 1.8 },
    { left: 90, top: 20, rotation: 150, delay: 0.6 },
    { left: 40, top: 90, rotation: 240, delay: 1.3 },
    { left: 60, top: 5, rotation: 30, delay: 0.4 },
    { left: 25, top: 85, rotation: 210, delay: 1.7 },
  ];

  const circuitNodePositions = [
    { left: 15, top: 20, delay: 0.5 },
    { left: 85, top: 15, delay: 1.2 },
    { left: 25, top: 60, delay: 0.8 },
    { left: 75, top: 45, delay: 1.5 },
    { left: 10, top: 80, delay: 0.3 },
    { left: 90, top: 70, delay: 2.1 },
    { left: 40, top: 30, delay: 0.9 },
    { left: 60, top: 85, delay: 1.8 },
    { left: 5, top: 40, delay: 0.6 },
    { left: 95, top: 25, delay: 1.3 },
    { left: 30, top: 10, delay: 0.4 },
    { left: 70, top: 55, delay: 1.7 },
    { left: 20, top: 90, delay: 0.7 },
    { left: 80, top: 35, delay: 1.4 },
    { left: 50, top: 5, delay: 0.2 },
    { left: 35, top: 75, delay: 1.6 },
    { left: 65, top: 15, delay: 0.9 },
    { left: 12, top: 50, delay: 1.1 },
    { left: 88, top: 60, delay: 1.9 },
    { left: 45, top: 95, delay: 0.8 },
  ];

  return (
    <div className="circuit-board-bg">
      <div className="circuit-paths">
        {circuitPathPositions.map((pos, i) => (
          <div
            key={i}
            className="circuit-path"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: `rotate(${pos.rotation}deg)`,
              animationDelay: `${pos.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="circuit-nodes">
        {circuitNodePositions.map((pos, i) => (
          <div
            key={i}
            className="circuit-node"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              animationDelay: `${pos.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Animation 7: Digital Waves
const DigitalWavesAnimation = () => (
  <div className="digital-waves-bg">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="digital-wave"
        style={{
          top: `${i * 16.66 + 8.33}%`,
          animationDelay: `${i * 0.5}s`,
        }}
      >
        {Array.from({ length: 50 }).map((_, j) => (
          <div
            key={j}
            className="wave-segment"
            style={{
              left: `${j * 2}%`,
              animationDelay: `${j * 0.05}s`,
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

// Animation 8: Cyber City
const CyberCityAnimation = () => {
  const buildingData = [
    { left: 5, height: 45, delay: 0.5 },
    { left: 15, height: 60, delay: 1.2 },
    { left: 25, height: 35, delay: 0.8 },
    { left: 35, height: 70, delay: 1.5 },
    { left: 45, height: 25, delay: 0.3 },
    { left: 55, height: 55, delay: 2.1 },
    { left: 65, height: 40, delay: 0.9 },
    { left: 75, height: 65, delay: 1.8 },
    { left: 85, height: 30, delay: 0.6 },
    { left: 95, height: 50, delay: 1.3 },
    { left: 10, height: 75, delay: 0.4 },
    { left: 20, height: 20, delay: 1.7 },
    { left: 30, height: 80, delay: 0.7 },
    { left: 40, height: 35, delay: 1.4 },
    { left: 50, height: 60, delay: 0.2 },
  ];

  const lightPositions = [
    { left: 8, top: 15, delay: 0.5 },
    { left: 18, top: 25, delay: 1.2 },
    { left: 28, top: 35, delay: 0.8 },
    { left: 38, top: 45, delay: 1.5 },
    { left: 48, top: 55, delay: 0.3 },
    { left: 58, top: 65, delay: 2.1 },
    { left: 68, top: 75, delay: 0.9 },
    { left: 78, top: 85, delay: 1.8 },
    { left: 88, top: 95, delay: 0.6 },
    { left: 12, top: 5, delay: 1.3 },
    { left: 22, top: 12, delay: 0.4 },
    { left: 32, top: 22, delay: 1.7 },
    { left: 42, top: 32, delay: 0.7 },
    { left: 52, top: 42, delay: 1.4 },
    { left: 62, top: 52, delay: 0.2 },
    { left: 72, top: 62, delay: 1.6 },
    { left: 82, top: 72, delay: 0.9 },
    { left: 92, top: 82, delay: 1.1 },
    { left: 15, top: 8, delay: 0.8 },
    { left: 25, top: 18, delay: 1.5 },
    { left: 35, top: 28, delay: 0.3 },
    { left: 45, top: 38, delay: 2.0 },
    { left: 55, top: 48, delay: 0.7 },
    { left: 65, top: 58, delay: 1.4 },
    { left: 75, top: 68, delay: 0.1 },
    { left: 85, top: 78, delay: 1.8 },
    { left: 95, top: 88, delay: 0.5 },
    { left: 5, top: 98, delay: 1.2 },
    { left: 16, top: 16, delay: 0.9 },
    { left: 26, top: 26, delay: 1.6 },
  ];

  return (
    <div className="cyber-city-bg">
      <div className="city-buildings">
        {buildingData.map((building, i) => (
          <div
            key={i}
            className="building"
            style={{
              left: `${building.left}%`,
              height: `${building.height}%`,
              animationDelay: `${building.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="city-lights">
        {lightPositions.map((light, i) => (
          <div
            key={i}
            className="city-light"
            style={{
              left: `${light.left}%`,
              top: `${light.top}%`,
              animationDelay: `${light.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Animation 9: Data Matrix
const DataMatrixAnimation = () => {
  // Predefined binary patterns to avoid Math.random() during render
  const binaryPatterns = [
    "1010101010101010101010101",
    "0101010101010101010101010",
    "1100110011001100110011001",
    "0011001100110011001100110",
    "1110001110001110001110001",
    "0001110001110001110001110",
    "1011011011011011011011011",
    "0100100100100100100100100",
    "1111110000001111110000001",
    "0000001111110000001111110",
    "1010101010101010101010101",
    "0101010101010101010101010",
    "1100110011001100110011001",
    "0011001100110011001100110",
    "1110001110001110001110001",
    "0001110001110001110001110",
    "1011011011011011011011011",
    "0100100100100100100100100",
    "1111110000001111110000001",
    "0000001111110000001111110",
  ];

  return (
    <div className="data-matrix-bg">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="matrix-column"
          style={{
            left: `${i * 5}%`,
            animationDelay: `${i * 0.2}s`,
          }}
        >
          {Array.from({ length: 25 }).map((_, j) => (
            <div
              key={j}
              className="matrix-symbol"
              style={{
                animationDelay: `${j * 0.1}s`,
              }}
            >
              {binaryPatterns[i][j]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Animation 10: AI Orbit
const AIOrbitAnimation = () => (
  <div className="ai-orbit-bg">
    <div className="orbit-center">
      <div className="core-particle"></div>
    </div>
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="orbit-ring"
        style={{
          animationDelay: `${i * 0.5}s`,
        }}
      >
        {Array.from({ length: 8 }).map((_, j) => (
          <div
            key={j}
            className="orbit-particle"
            style={{
              transform: `rotate(${j * 45}deg)`,
              animationDelay: `${j * 0.1}s`,
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

export default AnimatedBackground;
