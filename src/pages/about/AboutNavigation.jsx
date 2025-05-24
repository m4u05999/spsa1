// src/pages/about/AboutNavigation.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AboutNavigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const links = [
    { path: '/about', title: 'نبذة عن الجمعية' },
    { path: '/about/chairman', title: 'كلمة رئيس الجمعية' },
    { path: '/about/vision', title: 'الرؤية والأهداف' },
    { path: '/about/board', title: 'مجلس الإدارة' },
    { path: '/about/graduates', title: 'الخريجون' }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-100 rounded-lg p-4 mb-6 relative">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden w-full flex items-center justify-between px-4 py-2 bg-white rounded-md shadow-sm"
        aria-label="قائمة التنقل"
      >
        <span className="text-gray-700">
          {links.find(link => location.pathname === link.path)?.title || 'القائمة'}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isMenuOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
          />
        </svg>
      </button>

      {/* Desktop and Mobile Navigation */}
      <ul
        className={`${
          isMenuOpen ? 'block' : 'hidden'
        } lg:flex flex-col lg:flex-row gap-2 lg:gap-4 mt-2 lg:mt-0`}
      >
        {links.map((link) => (
          <li key={link.path} className="w-full lg:w-auto">
            <Link
              to={link.path}
              className={`block w-full text-right px-4 py-2 rounded-md transition-colors ${
                location.pathname === link.path
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-200'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AboutNavigation;