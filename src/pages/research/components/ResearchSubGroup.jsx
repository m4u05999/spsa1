// src/pages/research/components/ResearchSubGroup.jsx
import React, { useState } from 'react';

const ResearchSubGroup = ({ group, publications }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle groups without topics but with subtopics (like Comparative Politics structure)
  const hasSubtopics = group.subtopics && group.subtopics.length > 0;
  const hasTopics = group.topics && group.topics.length > 0;
  const hasPublications = publications && publications.length > 0;

  // فلترة المنشورات حسب القسم الفرعي
  const getPublicationsForSubtopic = (subtopicTitle) => {
    if (!publications) return [];
    
    // البحث عن المنشورات التي تتضمن اسم القسم الفرعي في اسم المجموعة
    return publications.filter(pub => pub.group.includes(`(${subtopicTitle})`));
  };
  
  // فلترة المنشورات للمجموعة الرئيسية لاستبعاد منشورات الأقسام الفرعية
  const getMainGroupPublications = () => {
    if (!publications) return [];
    
    // استبعاد أي منشور يحتوي على قوس لأنه يشير إلى منشور فرعي
    return publications.filter(pub => !pub.group.includes("("));
  };

  return (
    <div className="border-r-4 border-blue-500 pr-4 py-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-blue-800">{group.title}</h3>
          <p className="text-gray-600 mt-1">{group.description}</p>
        </div>
        {(hasTopics || hasSubtopics || hasPublications) && (
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
          
          {/* فقط إظهار المنشورات الرئيسية (التي ليست في أقسام فرعية) */}
          {hasPublications && getMainGroupPublications().length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">منشورات المجموعة:</h4>
              <div className="space-y-4">
                {getMainGroupPublications().map((pub, idx) => (
                  <div key={idx} className="bg-blue-50 p-4 rounded-md border border-blue-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-blue-800">{pub.title}</h5>
                        <p className="text-sm text-gray-600">{pub.authors.join('، ')}</p>
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
                  
                  {/* عرض المنشورات الخاصة بالقسم الفرعي */}
                  {(() => {
                    const subtopicPublications = getPublicationsForSubtopic(subtopic.title);
                    return subtopicPublications.length > 0 ? (
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">منشورات {subtopic.title}:</h5>
                        <div className="space-y-3">
                          {subtopicPublications.map((pub, pubIdx) => (
                            <div key={pubIdx} className="bg-blue-50 p-3 rounded-md border border-blue-100">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h6 className="font-semibold text-blue-800 text-sm">{pub.title}</h6>
                                  <p className="text-sm text-gray-600">{pub.authors.join('، ')}</p>
                                  <p className="text-sm text-gray-500">{pub.date}</p>
                                </div>
                                {pub.pdfUrl && (
                                  <a 
                                    href={pub.pdfUrl} 
                                    download 
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md py-1 px-2 text-xs flex items-center"
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
                    ) : null;
                  })()
                  }
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