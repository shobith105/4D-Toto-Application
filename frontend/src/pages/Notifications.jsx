import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import NotificationCard from '../components/NotificationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  getNotifications, 
  createMockNotification, 
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

  const handleCreateMockNotification = async () => {
    try {
      await createMockNotification();
      await fetchNotifications();
      alert('Mock notification created successfully!');
    } catch (error) {
      console.error('Error creating mock notification:', error);
      alert('Failed to create mock notification. Please try again.');
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
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-100 mb-2">Notifications</h1>
              <p className="text-slate-400">
                {unreadCount > 0 ? (
                  <span>
                    You have <span className="text-fuchsia-500 font-semibold">{unreadCount}</span> unread notification{unreadCount !== 1 && 's'}
                  </span>
                ) : (
                  <span>You're all caught up!</span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={createMockNotification}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
              >
                Create MohandleCk Notification
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Mark All as Read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-slate-700">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 font-semibold transition-colors ${
                filter === 'all'
                  ? 'text-fuchsia-500 border-b-2 border-fuchsia-500'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-6 py-3 font-semibold transition-colors ${
                filter === 'unread'
                  ? 'text-fuchsia-500 border-b-2 border-fuchsia-500'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-6 py-3 font-semibold transition-colors ${
                filter === 'read'
                  ? 'text-fuchsia-500 border-b-2 border-fuchsia-500'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
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
              className="h-24 w-24 mx-auto mb-4 text-slate-700"
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
            <h3 className="text-2xl font-bold text-slate-400 mb-2">No notifications</h3>
            <p className="text-slate-500">
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
