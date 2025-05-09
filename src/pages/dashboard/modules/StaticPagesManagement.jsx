import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';

const StaticPagesManagement = () => {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    isPublished: true
  });

  useEffect(() => {
    // Fetch static pages from backend
    // This is a mock implementation
    const mockPages = [
      {
        id: 1,
        title: 'About Us',
        slug: 'about-us',
        content: 'About us page content...',
        isPublished: true,
        lastModified: '2024-03-10'
      },
      {
        id: 2,
        title: 'Terms of Service',
        slug: 'terms-of-service',
        content: 'Terms of service content...',
        isPublished: true,
        lastModified: '2024-03-09'
      }
    ];
    setPages(mockPages);
  }, []);

  const handleCreate = () => {
    setSelectedPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      isPublished: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (page) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      isPublished: page.isPublished
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (pageId) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      // Delete page logic here
      setPages(pages.filter(page => page.id !== pageId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedPage) {
      // Update existing page
      const updatedPages = pages.map(page => 
        page.id === selectedPage.id ? { ...page, ...formData } : page
      );
      setPages(updatedPages);
    } else {
      // Create new page
      const newPage = {
        id: pages.length + 1,
        ...formData,
        lastModified: new Date().toISOString().split('T')[0]
      };
      setPages([...pages, newPage]);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Static Pages Management</h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Page
        </button>
      </div>

      {/* Pages Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {pages.map((page) => (
            <li key={page.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{page.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">/{page.slug}</p>
                  <p className="mt-1 text-sm text-gray-500">Last modified: {page.lastModified}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={page.isPublished}
                    onChange={() => {
                      const updatedPages = pages.map(p =>
                        p.id === page.id ? { ...p, isPublished: !p.isPublished } : p
                      );
                      setPages(updatedPages);
                    }}
                    className={`${
                      page.isPublished ? 'bg-indigo-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full`}
                  >
                    <span className="sr-only">Toggle publication status</span>
                    <span
                      className={`${
                        page.isPublished ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </Switch>
                  <button
                    onClick={() => handleEdit(page)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {selectedPage ? 'Edit Page' : 'Create New Page'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <Switch
                    checked={formData.isPublished}
                    onChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                    className={`${
                      formData.isPublished ? 'bg-indigo-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full mr-2`}
                  >
                    <span className="sr-only">Toggle publication status</span>
                    <span
                      className={`${
                        formData.isPublished ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </Switch>
                  <span className="text-sm text-gray-700">Published</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {selectedPage ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticPagesManagement;