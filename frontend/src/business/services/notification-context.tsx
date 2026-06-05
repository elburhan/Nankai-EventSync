import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  tone: 'success' | 'error' | 'info';
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  notify: (input: Omit<NotificationItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({ children }: PropsWithChildren) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dismiss = (id: string) => {
    setNotifications((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const notify = (input: Omit<NotificationItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setNotifications((currentItems) => [...currentItems, { ...input, id }]);
  };

  useEffect(() => {
    if (notifications.length === 0) {
      return;
    }

    const latestNotification = notifications[notifications.length - 1];
    const timeout = window.setTimeout(() => {
      dismiss(latestNotification.id);
    }, 3600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [notifications]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      notify,
      dismiss,
    }),
    [notifications],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
