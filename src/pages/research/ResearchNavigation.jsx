// src/pages/research/ResearchNavigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ResearchNavigation = () => {
  const location = useLocation();
  
  const links = [
    { path: '/research', title: 'نظرة عامة', exact: true },
    { path: '/research/regional-studies', title: 'الدراسات الإقليمية' },
    { path: '/research/international-relations', title: 'العلاقات الدولية' },
    { path: '/research/comparative-politics', title: 'السياسات المقارنة' },
    { path: '/research/political-thought', title: 'الفكر السياسي' }
  ];

  return (
    <nav className="bg-gray-100 rounded-lg p-4 mb-6">
      <ul className="flex flex-wrap gap-4">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={`px-4 py-2 rounded-md ${
                (link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path))
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-200'
              }`}
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ResearchNavigation;