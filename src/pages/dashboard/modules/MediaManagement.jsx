import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, DocumentIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

const MediaManagement = () => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockMedia = [
      {
        id: 1,
        name: 'conference-2024.jpg',
        type: 'image',
        url: '/assets/images/conference-2024.jpg',
        size: '2.4 MB',
        uploadedAt: '2024-03-10',
      },
      {
        id: 2,
        name: 'annual-report.pdf',
        type: 'document',
        url: '/assets/documents/annual-report.pdf',
        size: '1.2 MB',
        uploadedAt: '2024-03-09',
      },
      {
        id: 3,
        name: 'welcome-video.mp4',
        type: 'video',
        url: '/assets/videos/welcome-video.mp4',
        size: '15.7 MB',
        uploadedAt: '2024-03-08',
      },
    ];
    setMediaFiles(mockMedia);
  }, []);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    // Here you would typically upload the files to your backend
    // For now, we'll just add them to the list with mock data
    const newFiles = files.map((file, index) => ({
      id: mediaFiles.length + index + 1,
      name: file.name,
      type: file.type.split('/')[0],
      url: URL.createObjectURL(file),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0],
    }));
    
    setMediaFiles([...mediaFiles, ...newFiles]);
    setUploadModalOpen(false);
  };

  const handleDelete = (ids) => {
    if (window.confirm('Are you sure you want to delete the selected files?')) {
      setMediaFiles(mediaFiles.filter(file => !ids.includes(file.id)));
      setSelectedFiles([]);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="h-6 w-6" />;
      case 'video':
        return <VideoCameraIcon className="h-6 w-6" />;
      default:
        return <DocumentIcon className="h-6 w-6" />;
    }
  };

  const filteredMedia = filterType === 'all' 
    ? mediaFiles 
    : mediaFiles.filter(file => file.type === filterType);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Media Management</h1>
        <div className="flex space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All Files</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Upload Files
          </button>
          {selectedFiles.length > 0 && (
            <button
              onClick={() => handleDelete(selectedFiles)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete Selected
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredMedia.map((file) => (
            <li key={file.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles([...selectedFiles, file.id]);
                      } else {
                        setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-4"
                  />
                  <div className="min-w-0 flex-1 flex items-center">
                    <div className="flex-shrink-0 text-gray-500">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-indigo-600 truncate">
                        {file.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {file.size} • Uploaded on {file.uploadedAt}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-2 flex-shrink-0 flex space-x-4">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete([file.id])}
                    className="font-medium text-red-600 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Select files
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Any file up to 10MB
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManagement;