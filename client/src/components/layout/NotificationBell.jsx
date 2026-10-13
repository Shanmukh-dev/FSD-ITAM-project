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
        className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
          isOpen
            ? 'bg-[#B88728]/12 border-[#B88728]/40 text-[#996E1D] dark:bg-[#F1CB8D]/15 dark:border-[#F1CB8D]/40 dark:text-[#F1CB8D] shadow-xs'
            : 'bg-black/[0.03] hover:bg-black/[0.06] border-black/[0.06] text-zinc-600 hover:text-zinc-900 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-white/10 dark:text-zinc-300 dark:hover:text-white'
        }`}
        title="System Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B88728] dark:bg-[#F1CB8D] text-white dark:text-[#09090B] text-[10px] font-bold flex items-center justify-center shadow-xs dark:shadow-[0_0_10px_rgba(241,203,141,0.4)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white/95 dark:bg-[#121216]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between p-3.5 border-b border-black/[0.06] dark:border-white/10 bg-black/[0.02] dark:bg-black/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-900 dark:text-white tracking-wide uppercase">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#B88728]/15 dark:bg-[#F1CB8D]/15 text-[#996E1D] dark:text-[#F1CB8D] border border-[#B88728]/25 dark:border-[#F1CB8D]/30">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-[#996E1D] hover:text-[#B88728] dark:text-[#F1CB8D] dark:hover:text-[#F8E0B9] flex items-center gap-1 cursor-pointer font-medium transition-colors"
              >
                <Check size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-black/[0.04] dark:divide-white/[0.06] bg-transparent">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
                <div className="w-9 h-9 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-zinc-400 mb-2">
                  <Bell size={16} />
                </div>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">All caught up!</span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">No new notifications right now.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors cursor-pointer flex flex-col gap-1 ${
                    !n.isRead ? 'bg-[#B88728]/[0.06] dark:bg-[#F1CB8D]/[0.08]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-xs leading-snug ${
                        !n.isRead
                          ? 'text-zinc-900 dark:text-white font-semibold'
                          : 'text-zinc-700 dark:text-zinc-300 font-medium'
                      }`}
                    >
                      {n.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0 tabular-nums">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
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
