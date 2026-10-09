import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    setIsOpen(false);

    if (notification.relatedType === 'Asset' && notification.relatedId) {
      navigate(`/assets/${notification.relatedId}`);
    } else if (notification.relatedType === 'AssetRequest') {
      navigate('/requests');
    } else if (notification.relatedType === 'MaintenanceRequest') {
      navigate('/maintenance');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
          isOpen
            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-slate-800 dark:border-indigo-500/50 dark:text-white'
            : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-600 hover:text-slate-900 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:border-white/10 dark:text-slate-300 dark:hover:text-white'
        }`}
        title="System Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white tracking-wide uppercase">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium transition-colors"
              >
                <Check size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 mb-2">
                  <Bell size={16} />
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-300">All caught up!</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">No new notifications right now.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col gap-1 ${
                    !n.isRead ? 'bg-indigo-50/60 dark:bg-indigo-500/[0.08]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-xs leading-snug ${
                        !n.isRead
                          ? 'text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
