import React, { useState, useEffect } from 'react';
import NotificationCard from '../components/NotificationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification 
} from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      alert('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Failed to mark notification as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      alert('Failed to mark all notifications as read.');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      
      // Remove from local state
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification.');
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  return (
    <div className="min-h-screen text-white" style={{backgroundColor: '#020617'}}>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 md:mb-4 gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Notifications</h1>
              <p style={{color: '#cbd5e1'}}>
                {unreadCount > 0 ? (
                  <span>
                    You have <span className="text-white font-bold">{unreadCount}</span> unread notification{unreadCount !== 1 && 's'}
                  </span>
                ) : (
                  <span>You're all caught up!</span>
                )}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full sm:w-auto">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all font-semibold text-sm md:text-base"
                  style={{background: '#10b981', color: 'white'}}
                  onMouseEnter={(e) => e.target.style.background = '#059669'}
                  onMouseLeave={(e) => e.target.style.background = '#10b981'}
                >
                  Mark All as Read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 md:gap-2 overflow-x-auto" style={{borderBottom: '1px solid #334155'}}>
            <button
              onClick={() => setFilter('all')}
              className="px-4 md:px-6 py-2 md:py-3 font-semibold transition-colors text-sm md:text-base whitespace-nowrap"
              style={{
                color: filter === 'all' ? 'white' : '#94a3b8',
                borderBottom: filter === 'all' ? '2px solid #7c3aed' : 'none'
              }}
              onMouseEnter={(e) => { if (filter !== 'all') e.target.style.color = '#cbd5e1'; }}
              onMouseLeave={(e) => { if (filter !== 'all') e.target.style.color = '#94a3b8'; }}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className="px-4 md:px-6 py-2 md:py-3 font-semibold transition-colors text-sm md:text-base whitespace-nowrap"
              style={{
                color: filter === 'unread' ? 'white' : '#94a3b8',
                borderBottom: filter === 'unread' ? '2px solid #7c3aed' : 'none'
              }}
              onMouseEnter={(e) => { if (filter !== 'unread') e.target.style.color = '#cbd5e1'; }}
              onMouseLeave={(e) => { if (filter !== 'unread') e.target.style.color = '#94a3b8'; }}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className="px-4 md:px-6 py-2 md:py-3 font-semibold transition-colors text-sm md:text-base whitespace-nowrap"
              style={{
                color: filter === 'read' ? 'white' : '#94a3b8',
                borderBottom: filter === 'read' ? '2px solid #7c3aed' : 'none'
              }}
              onMouseEnter={(e) => { if (filter !== 'read') e.target.style.color = '#cbd5e1'; }}
              onMouseLeave={(e) => { if (filter !== 'read') e.target.style.color = '#94a3b8'; }}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <LoadingSpinner message="Fetching notifications..." />
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 mx-auto mb-4"
              style={{color: '#334155'}}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <h3 className="text-2xl font-bold mb-2" style={{color: '#cbd5e1'}}>No notifications</h3>
            <p style={{color: '#94a3b8'}}>
              {filter === 'unread'
                ? "You don't have any unread notifications"
                : filter === 'read'
                ? "You don't have any read notifications"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteNotification}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
