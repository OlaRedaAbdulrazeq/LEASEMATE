"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  senderId?: {
    _id: string;
    name: string;
  };
}

interface NotificationsContextType {
  notifications: Notification[];
  markAllAsRead: () => void;
  markSingleAsRead: (id: string) => void;
  addNotification: (notification: Notification) => void;
  loading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
};

const BASE_URL = 'http://localhost:5000';

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, socket } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id || !token) return;

    setLoading(true);
    fetch(`${BASE_URL}/api/notifications/${user._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return res.json();
      })
      .then((data) => {
        setNotifications(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?._id, token]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      console.log("🔔 New notification received:", notification);
      addNotification(notification);
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const markAllAsRead = () => {
    if (!user?._id || !token) return;

    fetch(`${BASE_URL}/api/notifications/mark-all-read/${user._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to mark all as read");
        return res.json();
      })
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      })
      .catch(console.error);
  };

  const markSingleAsRead = (id: string) => {
    if (!token) return;

    fetch(`${BASE_URL}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to mark as read");
        return res.json();
      })
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      })
      .catch(console.error);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        markAllAsRead,
        markSingleAsRead,
        addNotification,
        loading,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
