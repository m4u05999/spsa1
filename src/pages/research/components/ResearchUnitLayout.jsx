// src/pages/research/components/ResearchUnitLayout.jsx
import React from 'react';

const ResearchUnitLayout = ({ title, description, members, publications, currentProjects }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>



      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">المنشورات</h3>
        <div className="space-y-4">
          {publications.map((pub, index) => (
            <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{pub.title}</h4>
                  <p className="text-sm text-gray-600">{pub.authors.join('، ')}</p>
                  {pub.group && <p className="text-sm text-gray-600 italic">({pub.group})</p>}
                  <p className="text-sm text-gray-500">{pub.date}</p>
                </div>
                {pub.pdfUrl && (
                  <a 
                    href={pub.pdfUrl} 
                    download 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md py-1 px-3 text-sm flex items-center"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    تحميل
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResearchUnitLayout;