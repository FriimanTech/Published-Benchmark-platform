'use client';

import React from 'react';

const HeroSection = () => {
  return (
    <div className="relative h-[60vh] w-full overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-blue-700/30 to-blue-500/30 backdrop-blur-[1px]" />
        </div>
      </div>
      
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        <h1 className="animate-fade-in bg-gradient-to-br from-white to-gray-400 bg-clip-text text-5xl font-bold text-transparent sm:text-7xl">
          ML Benchmark Platform
        </h1>
        <p className="mt-4 animate-fade-in text-lg text-gray-300">
          Evaluate and compare machine learning models with precision
        </p>
        <div className="mt-8 animate-fade-in">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <button className="relative px-8 py-3 bg-black rounded-lg text-white font-semibold">
              Get Started
            </button>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg opacity-20"></div>
        <div className="floating-element absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20"></div>
        <div className="floating-element absolute bottom-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-blue-400 to-green-400 rounded-lg opacity-20"></div>
      </div>
    </div>
  );
};

export default HeroSection;
