"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  leaseId?: string;
  maintenanceRequestId?: string;
  landlordId?: string;
  tenantId?: string;
  isRead: boolean;
  createdAt: string;
  senderId?: {
    _id: string;
    name: string;
  };
  disabled?: boolean;
  meta?: any;
}

interface NotificationsContextType {
  notifications: Notification[];
  markAllAsRead: () => void;
  markSingleAsRead: (id: string) => void;
  handleNotificationClick: (notification: Notification) => void;
  loading: boolean;
  showToast: (message: string) => void;
  isProcessingClick: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider");
  return context;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, socket } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  const fallbackFetched = useRef(false);
  const socketReceived = useRef(false);

  const BASE_URL = 'http://localhost:5000';

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
    try {
      const audio = new Audio('data:audio/wav;base64,...');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}
  };

  const fetchNotifications = () => {
    if (!user?._id || !token) return;
    
    setLoading(true);
    
    fetch(`${BASE_URL}/api/notifications/${user._id}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setNotifications(data.data || []);
      })
      .catch(err => {
        console.error('Error fetching notifications:', err);
        setNotifications([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setNotifications([]);
    setLoading(true);
    fallbackFetched.current = false;
    socketReceived.current = false;
    
    if (user?._id && token) {
      fetchNotifications();
    }
  }, [user?._id, token]);

  useEffect(() => {
    if (!socket || !user?._id) return;

    const handleNewNotification = (notification: Notification) => {
      socketReceived.current = true;
      setLoading(false);
      setNotifications((prev) => {
        if (prev.some(n => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });

      if (notification.title) showToast(`📢 ${notification.title}`);
    };

    socket.on("newNotification", handleNewNotification);

    const fallbackTimeout = setTimeout(() => {
      if (!socketReceived.current && !fallbackFetched.current) {
        fallbackFetched.current = true;
        fetchNotifications();
      }
    }, 2000);

    return () => {
      socket.off("newNotification", handleNewNotification);
      clearTimeout(fallbackTimeout);
    };
  }, [socket, user?._id, token]);

  const markAllAsRead = () => {
    if (!user?._id || !token) return;
    fetch(`${BASE_URL}/api/notifications/mark-all-read/${user._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
      .then(res => res.json())
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      })
      .catch(console.error);
  };

  const markSingleAsRead = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }
      
      const data = await response.json();
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (isProcessingClick) return;
    
    setIsProcessingClick(true);
    try {
      await markSingleAsRead(notification._id);
      
      // Don't navigate for these notification types
      if (notification.type === 'REFUND_SUCCESS' || notification.type === 'PAYMENT_SUCCESS') {
        return;
      }
      
      let targetLink = notification.link || '/dashboard';
      
      if (notification.type === 'LEASE_EXPIRED') {
        if (notification.leaseId && notification.landlordId && notification.tenantId) {
          const isLandlord = user?._id === notification.landlordId;
          const isTenant = user?._id === notification.tenantId;
          
          if (isLandlord || isTenant) {
            const revieweeId = isLandlord ? notification.tenantId : notification.landlordId;
            targetLink = `/leave-review?leaseId=${notification.leaseId}&revieweeId=${revieweeId}`;
          }
        }
      }
      
      router.push(targetLink);
    } catch (error) {
      console.error('Error handling notification click:', error);
      
      // Don't navigate for these notification types even on error
      if (notification.type === 'REFUND_SUCCESS' || notification.type === 'PAYMENT_SUCCESS') {
        return;
      }
      
      const targetLink = notification.link || '/dashboard';
      router.push(targetLink);
    } finally {
      setIsProcessingClick(false);
    }
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      markAllAsRead,
      markSingleAsRead,
      handleNotificationClick,
      loading,
      showToast,
      isProcessingClick
    }}>
      {children}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}
    </NotificationsContext.Provider>
  );
};
