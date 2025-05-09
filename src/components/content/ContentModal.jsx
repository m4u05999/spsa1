import React, { useState, useEffect } from 'react';
import ContentForm from './ContentForm';
import { createDefaultContent } from '../../models/Content';

/**
 * ContentModal - Modal component for creating and editing content
 */
const ContentModal = ({
  isOpen,
  onClose,
  initialContent = null,
  onSubmit,
  title = 'إضافة محتوى جديد',
  loading = false,
  availableCategories = [],
  availableTags = []
}) => {
  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // Prepare the initial content - either use provided content or create default
  const contentToEdit = initialContent || createDefaultContent();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
        >
          {/* Modal header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClose}
              >
                <span className="sr-only">إغلاق</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal content */}
          <div className="bg-white px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <ContentForm
              initialContent={contentToEdit}
              onSubmit={(formData) => {
                onSubmit(formData);
              }}
              onCancel={onClose}
              loading={loading}
              availableCategories={availableCategories}
              availableTags={availableTags}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentModal;