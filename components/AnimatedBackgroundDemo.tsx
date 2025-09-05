"use client";

import { useState, useEffect } from "react";

interface AnimatedBackgroundDemoProps {
  className?: string;
  intervalSeconds?: number; // For demo purposes, default 10 seconds
}

const AnimatedBackgroundDemo = ({
  className = "",
  intervalSeconds = 10,
}: AnimatedBackgroundDemoProps) => {
  const [currentAnimation, setCurrentAnimation] = useState(0);

  // 5 different AI-themed background animations
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
  ];

  // Change animation every specified seconds (default 10 for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimation((prev) => (prev + 1) % animations.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [animations.length, intervalSeconds]);

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Animation indicator for demo */}
      <div className="absolute top-4 left-4 z-50 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Animation: {animations[currentAnimation].title}</span>
        </div>
      </div>

      {animations[currentAnimation].component}
    </div>
  );
};

// Animation 1: Neural Network
const NeuralNetworkAnimation = () => (
  <div className="neural-network-bg">
    <div className="neural-nodes">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="neural-node"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
    <div className="neural-connections">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="neural-connection"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  </div>
);

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
const QuantumParticlesAnimation = () => (
  <div className="quantum-particles-bg">
    {Array.from({ length: 25 }).map((_, i) => (
      <div
        key={i}
        className="quantum-particle"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 4}s`,
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

// Animation 5: Holographic Grid
const HolographicGridAnimation = () => (
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
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="grid-node"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  </div>
);

export default AnimatedBackgroundDemo;
