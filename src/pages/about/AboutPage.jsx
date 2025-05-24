// src/pages/about/AboutPage.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AboutNavigation from './AboutNavigation';
import AboutIntro from './components/AboutIntro';
import ChairmanMessage from './components/ChairmanMessage';
import VisionMission from './components/VisionMission';
import Graduates from './components/Graduates';
import Board from './components/Board';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">من نحن</h1>
          <p className="text-base sm:text-xl text-blue-200">
            تعرف على جمعية العلوم السياسية وأهدافها ورسالتها
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AboutNavigation />
        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route index element={<AboutIntro />} />
            <Route path="chairman" element={<ChairmanMessage />} />
            <Route path="vision" element={<VisionMission />} />
            <Route path="graduates" element={<Graduates />} />
            <Route path="board" element={<Board />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;