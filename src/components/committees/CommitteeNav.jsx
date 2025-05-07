// src/components/committees/CommitteeNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const CommitteeNav = () => {
  const location = useLocation();

  const links = [
    { path: '/committees', title: 'جميع اللجان' },
    { path: '/committees/scientific', title: 'العلمية والاستشارية' },
    { path: '/committees/media', title: 'الإعلامية' },
    { path: '/committees/legal', title: 'القانونية' },
    { path: '/committees/corporate', title: 'الاتصال المؤسسي' },
    { path: '/committees/finance', title: 'المالية' }
  ];

  return (
    <nav className="bg-gray-100 rounded-lg p-4 mb-8">
      <ul className="flex flex-wrap gap-4">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={`px-4 py-2 rounded-md ${
                location.pathname === link.path
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

export default CommitteeNav;