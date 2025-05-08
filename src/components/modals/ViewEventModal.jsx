// src/components/modals/ViewEventModal.jsx
import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const ViewEventModal = ({ isOpen, closeModal, event }) => {
  if (!event) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-right align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  تفاصيل الفعالية
                </Dialog.Title>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700">العنوان</h4>
                    <p className="text-gray-900">{event.title}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">التاريخ</h4>
                    <p className="text-gray-900">{event.date}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">الموقع</h4>
                    <p className="text-gray-900">{event.location}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">الحالة</h4>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${event.status === 'قادم' ? 'bg-green-100 text-green-800' : 
                        event.status === 'جاري' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {event.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">عدد الحضور</h4>
                    <p className="text-gray-900">{event.attendees}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    onClick={closeModal}
                  >
                    إغلاق
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ViewEventModal;