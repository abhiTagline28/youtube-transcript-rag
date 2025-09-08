"use client";

import { useState } from "react";
import AnimatedBackgroundDemo from "@/components/AnimatedBackgroundDemo";

export default function DemoPage() {
  const [demoMode, setDemoMode] = useState(true);
  const [intervalSeconds, setIntervalSeconds] = useState(10);

  return (
    <div className="min-h-screen relative">
      {/* Demo Controls */}
      <div className="absolute top-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-lg font-semibold mb-3">Animation Demo Controls</h3>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="demoMode"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="demoMode" className="text-sm">
              Demo Mode (Fast Rotation)
            </label>
          </div>

          {demoMode && (
            <div>
              <label className="text-sm block mb-1">
                Rotation Interval: {intervalSeconds}s
              </label>
              <input
                type="range"
                min="3"
                max="30"
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              AI Animated Backgrounds
            </h1>
            <p className="text-lg text-gray-300">
              Experience 10 different AI-themed animated backgrounds that cycle
              automatically
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-purple-400">
                🧠 Neural Network
              </h3>
              <p className="text-gray-300 text-sm">
                Pulsing nodes and flowing connections that simulate neural
                network activity
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-cyan-400">
                📊 Data Streams
              </h3>
              <p className="text-gray-300 text-sm">
                Flowing data particles representing real-time information
                processing
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-green-400">
                🌧️ Matrix Rain
              </h3>
              <p className="text-gray-300 text-sm">
                Falling characters in the iconic Matrix digital rain effect
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-purple-400">
                ⚛️ Quantum Particles
              </h3>
              <p className="text-gray-300 text-sm">
                Floating particles with quantum wave effects and energy fields
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">
                🔲 Holographic Grid
              </h3>
              <p className="text-gray-300 text-sm">
                Pulsing grid lines and glowing nodes creating a futuristic
                interface
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-orange-400">
                🔧 Circuit Board
              </h3>
              <p className="text-gray-300 text-sm">
                Glowing circuit paths and nodes simulating electronic
                connections
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-cyan-400">
                🌊 Digital Waves
              </h3>
              <p className="text-gray-300 text-sm">
                Flowing digital wave patterns representing data transmission
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-gray-400">
                🏙️ Cyber City
              </h3>
              <p className="text-gray-300 text-sm">
                Futuristic cityscape with glowing buildings and twinkling lights
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-green-400">
                🔢 Data Matrix
              </h3>
              <p className="text-gray-300 text-sm">
                Binary code falling like rain in a digital matrix environment
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-purple-400">
                🪐 AI Orbit
              </h3>
              <p className="text-gray-300 text-sm">
                Orbital particles rotating around a central AI core with
                multiple rings
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-3 text-yellow-400">
                ⏰ Auto Rotation
              </h3>
              <p className="text-gray-300 text-sm">
                Backgrounds automatically change every 15 seconds for dynamic
                experience
              </p>
            </div>
          </div>

          <div className="card text-center">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-300">
              <div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎨</span>
                </div>
                <h4 className="font-semibold mb-2">10 Unique Designs</h4>
                <p>
                  Each animation has its own AI-themed visual style and behavior
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⏱️</span>
                </div>
                <h4 className="font-semibold mb-2">Smart Timing</h4>
                <p>
                  Automatic rotation every 15 seconds keeps the experience fresh
                  and dynamic
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📱</span>
                </div>
                <h4 className="font-semibold mb-2">Responsive</h4>
                <p>
                  Optimized for all devices with reduced intensity on mobile
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background */}
      {demoMode ? (
        <AnimatedBackgroundDemo intervalSeconds={intervalSeconds} />
      ) : (
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      )}
    </div>
  );
}
