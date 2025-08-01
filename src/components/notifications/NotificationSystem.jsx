import React from 'react';
import { useNotifications, NOTIFICATION_TYPES } from '../../contexts/NotificationContext';

const NotificationSystem = () => {
  const { notifications, removeNotification } = useNotifications();
  
  if (!notifications || notifications.length === 0) {
    return null;
  }

  const getNotificationStyles = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500'
        };
      case NOTIFICATION_TYPES.ERROR:
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500'
        };
      case NOTIFICATION_TYPES.WARNING:
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500'
        };
      default:
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500'
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => {
        const styles = getNotificationStyles(notification.type);
        
        return (
          <div
            key={notification.id}
            className={`${styles.bgColor} ${styles.textColor} ${styles.borderColor} border rounded-lg p-4 shadow-lg transition-all duration-300`}
          >
            <div className="flex items-start">
              <div className="flex-1">
                <h4 className="text-sm font-medium">{notification.title}</h4>
                {notification.message && (
                  <p className="mt-1 text-sm opacity-90">{notification.message}</p>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className={`${styles.iconColor} hover:opacity-75 transition-opacity flex-shrink-0 mr-2`}
                aria-label="إغلاق"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationSystem;
