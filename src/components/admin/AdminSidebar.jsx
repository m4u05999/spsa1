// src/components/admin/AdminSidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  // قائمة بالأقسام المتاحة في لوحة تحكم الإدارة
  const sidebarItems = [
    { id: 'dashboard', title: 'الرئيسية', icon: 'tachometer-alt' },
    { id: 'members', title: 'الأعضاء', icon: 'users' },
    { id: 'events', title: 'الفعاليات', icon: 'calendar-alt' },
    { id: 'committees', title: 'اللجان', icon: 'tasks' },
    { id: 'research', title: 'الوحدات البحثية', icon: 'book' },
    { id: 'publications', title: 'المطبوعات', icon: 'file-alt' },
    { id: 'courses', title: 'الدورات التدريبية', icon: 'chalkboard-teacher' },
    { id: 'conferences', title: 'المؤتمرات', icon: 'microphone' },
    { id: 'contributors', title: 'المساهمون والمتبرعون', icon: 'hand-holding-heart' },
    { id: 'settings', title: 'إعدادات الموقع', icon: 'cogs' },
    { id: 'employees', title: 'الموظفون', icon: 'user-tie' },
  ];

  // معالج تغيير القسم النشط
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen overflow-y-auto sticky top-0 hidden md:block">
      <div className="p-4">
        <h2 className="text-xl font-bold text-center mb-6 border-b border-gray-700 pb-3">لوحة تحكم الإدارة</h2>
        <nav>
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center p-2.5 rounded-md text-right ${
                    activeSection === item.id
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <i className={`fas fa-${item.icon} ml-2`}></i>
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800 mt-6">
        <Link to="/" className="flex items-center p-2 text-gray-300 hover:bg-gray-800 rounded-md mb-2">
          <i className="fas fa-home ml-2"></i>
          العودة للموقع
        </Link>
        <button className="w-full flex items-center p-2 text-gray-300 hover:bg-gray-800 rounded-md text-right">
          <i className="fas fa-sign-out-alt ml-2"></i>
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;