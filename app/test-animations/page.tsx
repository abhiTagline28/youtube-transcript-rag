"use client";

import { useState } from "react";

export default function TestAnimationsPage() {
  const [showIndicator, setShowIndicator] = useState(true);

  return (
    <div className="min-h-screen relative">
      {/* Test Controls */}
      <div className="absolute top-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-lg font-semibold mb-3">Animation Test</h3>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showIndicator"
              checked={showIndicator}
              onChange={(e) => setShowIndicator(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showIndicator" className="text-sm">
              Show Animation Indicator
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Animation Test Page
            </h1>
            <p className="text-lg text-gray-300">
              This page tests the animated background system. You should see 5
              different AI-themed backgrounds cycling every 15 seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-purple-400">
                🧠 Neural Network
              </h3>
              <p className="text-gray-300 text-sm">
                Look for pulsing nodes and flowing connections
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-cyan-400">
                📊 Data Streams
              </h3>
              <p className="text-gray-300 text-sm">
                Look for flowing data particles in vertical streams
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-green-400">
                🌧️ Matrix Rain
              </h3>
              <p className="text-gray-300 text-sm">
                Look for falling characters in green
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-purple-400">
                ⚛️ Quantum Particles
              </h3>
              <p className="text-gray-300 text-sm">
                Look for floating particles with wave effects
              </p>
            </div>
          </div>

          <div className="card text-center mt-8">
            <h2 className="text-2xl font-semibold mb-4">Background Status</h2>
            <div className="text-sm text-gray-300">
              <p>
                If you can see animated elements behind this content, the
                background system is working!
              </p>
              <p className="mt-2">
                The animations should change every 15 seconds automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hide indicator if disabled */}
      <style jsx>{`
        .animation-indicator {
          display: ${showIndicator ? "block" : "none"};
        }
      `}</style>
    </div>
  );
}

