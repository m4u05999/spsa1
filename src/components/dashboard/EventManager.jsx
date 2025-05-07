// src/components/dashboard/EventManager.jsx
import React, { useState } from 'react';

const EventManager = ({ readOnly = false }) => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'المؤتمر السنوي',
      date: '2024-03-15',
      location: 'قاعة الملك فيصل',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'ورشة عمل: مناهج البحث',
      date: '2024-02-20',
      location: 'المكتبة المركزية',
      status: 'upcoming'
    }
  ]);

  const addEvent = (event) => {
    if (readOnly) return;
    setEvents([...events, { ...event, id: events.length + 1 }]);
  };

  const updateEventStatus = (eventId, newStatus) => {
    if (readOnly) return;
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, status: newStatus } : event
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">إدارة الفعاليات</h2>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-500">
                  التاريخ: {event.date} | المكان: {event.location}
                </p>
              </div>
              {!readOnly && (
                <select
                  value={event.status}
                  onChange={(e) => updateEventStatus(event.id, e.target.value)}
                  className="border rounded-md px-2 py-1"
                >
                  <option value="upcoming">قادم</option>
                  <option value="ongoing">جاري</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventManager;