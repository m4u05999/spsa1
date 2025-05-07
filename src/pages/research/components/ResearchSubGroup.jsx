// src/pages/research/components/ResearchSubGroup.jsx
import React, { useState } from 'react';

const ResearchSubGroup = ({ group }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle groups without topics but with subtopics (like Comparative Politics structure)
  const hasSubtopics = group.subtopics && group.subtopics.length > 0;
  const hasTopics = group.topics && group.topics.length > 0;

  return (
    <div className="border-r-4 border-blue-500 pr-4 py-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-blue-800">{group.title}</h3>
          <p className="text-gray-600 mt-1">{group.description}</p>
        </div>
        {(hasTopics || hasSubtopics) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            <span>{isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-300 ${
                isExpanded ? 'transform rotate-90' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4">
          {hasTopics && (
            <div className="mt-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">مجالات البحث:</h4>
              <ul className="mr-6 space-y-1 list-disc text-gray-600">
                {group.topics.map((topic, idx) => (
                  <li key={idx} className="text-sm">{topic}</li>
                ))}
              </ul>
            </div>
          )}

          {hasSubtopics && (
            <div className="mt-4 space-y-4">
              {group.subtopics.map((subtopic, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <h4 className="text-md font-semibold text-blue-700">{subtopic.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{subtopic.description}</p>
                  {subtopic.topics && subtopic.topics.length > 0 && (
                    <div className="mt-2">
                      <h5 className="text-sm font-medium text-gray-700">مجالات البحث:</h5>
                      <ul className="mr-6 space-y-1 list-disc text-gray-600">
                        {subtopic.topics.map((topic, topicIdx) => (
                          <li key={topicIdx} className="text-sm">{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchSubGroup;