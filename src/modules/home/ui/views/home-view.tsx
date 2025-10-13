'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export const  HomeView= ()=> {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { 
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-emerald-100'}`}>
      {/* Fluid Wave Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {/* Fluid wave layers */}
          <div className={`absolute inset-0 ${isDarkMode ? 'opacity-20' : 'opacity-30'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/40 via-green-500/60 to-teal-400/40 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/30 via-emerald-700/50 to-teal-600/30 animate-pulse animation-delay-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-teal-500/20 via-green-600/40 to-emerald-500/20 animate-pulse animation-delay-2000"></div>
          </div>

          {/* Animated wave patterns */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-green-400/10 to-transparent transform rotate-12 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent transform -rotate-12 animate-pulse animation-delay-1500"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-teal-400/10 to-transparent transform rotate-6 animate-pulse animation-delay-3000"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`relative z-10 flex items-center justify-between px-8 py-6 ${isDarkMode ? 'bg-gray-800/70 border-b border-gray-700/50' : 'bg-white/70'}`}>
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center ${isDarkMode ? 'shadow-lg shadow-green-500/20' : ''}`}>
            <i className="ri-leaf-line text-white text-xl"></i>
          </div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: 'Pacifico, serif' }}>
            SwathAI
          </h1>
        </div>

        {/* Right Side Navigation */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className={`ri-search-line text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 text-sm rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isDarkMode ? 'bg-gray-700/70 text-white placeholder-gray-400 border border-gray-600/50 backdrop-blur-sm' : 'bg-white/70 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
              }`}
            />
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'bg-gray-700/70 text-yellow-400 hover:bg-gray-600/70 shadow-lg backdrop-blur-sm' : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200/70 backdrop-blur-sm'
            }`}
          >
            <i className={`text-lg ${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
          </button>

          {/* User Profile */}
          <Link href="/sign-in">
          <div className={`w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow ${isDarkMode ? 'shadow-lg shadow-green-500/20' : ''}`}>
            <i className="ri-user-line text-white text-lg"></i>
          </div>
        </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-8 py-16">
        {/* Welcome Heading */}
        <div className="text-center mb-16">
          <h2 className={`text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Discover Natural Healing
          </h2>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Your AI-powered Ayurvedic Health Assistant
          </p>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Discover natural remedies, identify plants, and learn about their uses
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {/* Identify Plant */}
          <Link href="/identify-plant">
            <div className={`group relative overflow-hidden rounded-2xl p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              isDarkMode ? 'bg-gray-800/30 backdrop-blur-md border border-gray-700/30 hover:border-green-500/50' : 'bg-white/30 backdrop-blur-md border border-white/20'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-300 ${
                isDarkMode
                  ? 'from-green-500/10 to-emerald-600/10 group-hover:from-green-500/20 group-hover:to-emerald-600/20'
                  : 'from-green-400/10 to-emerald-500/10 group-hover:from-green-400/20 group-hover:to-emerald-500/20'
              }`}></div>
              <div className="relative z-10">
                <div className={`w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow ${isDarkMode ? 'shadow-lg shadow-green-500/30' : ''}`}>
                  <i className="ri-scan-line text-white text-3xl"></i>
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Identify a Plant
                </h3>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Advanced object detection to identify any plant species instantly using AI
                </p>
                <div className="mt-6 inline-flex items-center text-green-600 font-semibold whitespace-nowrap">
                  Get Started
                  <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
            </div>
          </Link>

          {/* Ayurvedic Remedy */}
          <Link href="/ayurvedic-remedy">
            <div className={`group relative overflow-hidden rounded-2xl p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              isDarkMode ? 'bg-gray-800/30 backdrop-blur-md border border-gray-700/30 hover:border-emerald-500/50' : 'bg-white/30 backdrop-blur-md border border-white/20'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-300 ${
                isDarkMode
                  ? 'from-emerald-500/10 to-teal-600/10 group-hover:from-emerald-500/20 group-hover:to-teal-600/20'
                  : 'from-emerald-400/10 to-teal-500/10 group-hover:from-emerald-400/20 group-hover:to-teal-500/20'
              }`}></div>
              <div className="relative z-10">
                <div className={`w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow ${isDarkMode ? 'shadow-lg shadow-emerald-500/30' : ''}`}>
                  <i className="ri-medicine-bottle-line text-white text-3xl"></i>
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Tell Your Symptoms
                </h3>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Describe your symptoms and get personalized ayurvedic remedies
                </p>
                <div className="mt-6 inline-flex items-center text-emerald-600 font-semibold whitespace-nowrap">
                  Find Remedies
                  <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
            </div>
          </Link>

          {/* Grow Plant */}
          <Link href="/grow-plant">
            <div className={`group relative overflow-hidden rounded-2xl p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              isDarkMode ? 'bg-gray-800/30 backdrop-blur-md border border-gray-700/30 hover:border-teal-500/50' : 'bg-white/30 backdrop-blur-md border border-white/20'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-300 ${
                isDarkMode
                  ? 'from-teal-500/10 to-green-600/10 group-hover:from-teal-500/20 group-hover:to-green-600/20'
                  : 'from-teal-400/10 to-green-500/10 group-hover:from-teal-400/20 group-hover:to-green-500/20'
              }`}></div>
              <div className="relative z-10">
                <div className={`w-20 h-20 bg-gradient-to-r from-teal-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow ${isDarkMode ? 'shadow-lg shadow-teal-500/30' : ''}`}>
                  <i className="ri-plant-line text-white text-3xl"></i>
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Grow a Plant
                </h3>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Learn to cultivate healing herbs at home with personalized guidance
                </p>
                <div className="mt-6 inline-flex items-center text-teal-600 font-semibold whitespace-nowrap">
                  Start Growing
                  <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Powered by AI • Traditional Ayurveda • Modern Technology
          </p>
        </div>
      </main>

      {/* Enhanced CSS for smooth fluid wave animations */}
      <style jsx>{`
        @keyframes smoothFlowRight {
          0% { transform: translateX(-200px) translateY(0px) rotate(8deg); opacity: 0.3; }
          25% { transform: translateX(25vw) translateY(-10px) rotate(10deg); opacity: 0.6; }
          50% { transform: translateX(50vw) translateY(5px) rotate(12deg); opacity: 0.4; }
          75% { transform: translateX(75vw) translateY(-5px) rotate(14deg); opacity: 0.7; }
          100% { transform: translateX(calc(100vw + 200px)) translateY(0px) rotate(16deg); opacity: 0.2; }
        }

        @keyframes smoothFlowLeft {
          0% { transform: translateX(calc(100vw + 200px)) translateY(0px) rotate(-8deg); opacity: 0.2; }
          25% { transform: translateX(75vw) translateY(8px) rotate(-10deg); opacity: 0.5; }
          50% { transform: translateX(50vw) translateY(-3px) rotate(-12deg); opacity: 0.6; }
          75% { transform: translateX(25vw) translateY(6px) rotate(-14deg); opacity: 0.4; }
          100% { transform: translateX(-200px) translateY(0px) rotate(-16deg); opacity: 0.3; }
        }

        @keyframes gentleFloat {
          0% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(2deg); }
          66% { transform: translateY(4px) rotate(-1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        .animate-smooth-flow-right {
          animation: smoothFlowRight 20s ease-in-out infinite;
        }

        .animate-smooth-flow-left {
          animation: smoothFlowLeft 25s ease-in-out infinite;
        }

        .animate-gentle-float {
          animation: gentleFloat 8s ease-in-out infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-1500 {
          animation-delay: 1.5s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-5000 {
          animation-delay: 5s;
        }
      `}</style>
    </div>
  );
}