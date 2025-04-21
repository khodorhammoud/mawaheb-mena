import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { NotificationType } from '~/types/delete-me-enums';

// Match your existing notification interface structure
interface Notification {
  id: number;
  type: NotificationType | string;
  title: string;
  message: string;
  isRead: boolean;
  severity?: string;
  createdAt: string | Date;
  readAt: string | Date | null;
  payload?: Record<string, any>;
}

// Declare window.ENV for TypeScript
declare global {
  interface Window {
    ENV?: {
      API_URL?: string;
    };
  }
}

// Context type definition
interface NotificationContextType {
  notifications: Notification[];
  refreshNotifications: () => Promise<void>;
  loading: boolean;
  lastUpdate: Date | null;
}

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook to use the context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  userId?: number;
  initialNotifications?: Notification[];
}

export function NotificationProvider({
  children,
  userId,
  initialNotifications = [],
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState<boolean>(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Function to refresh notifications from the server
  const refreshNotifications = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Get the actual hostname but use port 3001 for backend
      const baseUrl =
        typeof window !== 'undefined'
          ? `${window.location.protocol}//${window.location.hostname}:3001` // Use port 3001 for backend
          : 'http://localhost:3001'; // Default fallback

      console.log(
        'Fetching notifications from:',
        `${baseUrl}/notifications/user/${userId}?limit=50` // Increased limit to get more notifications
      );
      const response = await fetch(`${baseUrl}/notifications/user/${userId}?limit=50`);
      if (response.ok) {
        const data = await response.json();
        console.log(`Fetched ${data.length} notifications from server, including unread ones`);

        // Sort notifications by date (newest first)
        const sortedData = [...data].sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setNotifications(sortedData);
        setLastUpdate(new Date());
      } else {
        console.error('Failed to fetch notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Setup SSE connection when userId is available
  useEffect(() => {
    if (!userId) return;

    // Close any existing connection
    if (eventSource) {
      console.log('Closing existing SSE connection');
      eventSource.close();
    }

    // Get the actual hostname but use port 3001 for backend
    const baseUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:3001` // Use port 3001 for backend
        : 'http://localhost:3001'; // Default fallback

    const url = `${baseUrl}/events/notifications/${userId}`;
    console.log('Attempting to connect to SSE at:', url);

    // Track connection state
    let isConnected = false;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    let reconnectTimer: NodeJS.Timeout | null = null;

    // Function to create a new EventSource with all handlers
    const createEventSource = () => {
      try {
        const newEventSource = new EventSource(url);

        // Handle successful connection
        newEventSource.onopen = () => {
          console.log('✅ SSE connection successfully opened for notifications');
          isConnected = true;
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection

          // Refresh notifications on successful connection to ensure we have the latest data
          refreshNotifications();
        };

        // Handle incoming messages
        newEventSource.onmessage = event => {
          // Reset reconnect attempts on successful message
          reconnectAttempts = 0;

          try {
            const data = JSON.parse(event.data);

            // Handle different event types
            if (data.type === 'heartbeat') {
              // Just log on dev, no action needed - connection is alive
              console.log('💓 SSE heartbeat received');
              return;
            }

            if (data.type === 'connection') {
              console.log('🔌 SSE connection established with server');
              return;
            }

            // For notification messages with embedded notification data
            if (data.type === 'notification' && data.notification) {
              console.log('🔔 New notification arrived via SSE:', data.notification);

              // Add the new notification to our state directly
              setNotifications(prev => {
                // Make sure we don't duplicate notifications
                if (prev.some(n => n.id === data.notification.id)) {
                  console.log('⚠️ Duplicate notification detected, not adding to state');
                  return prev;
                }

                // Process the notification date
                let notification = data.notification;
                if (typeof notification.createdAt === 'string') {
                  // Keep as is - will be converted during sorting
                } else if (notification.createdAt instanceof Date) {
                  // Keep as is
                } else if (notification.createdAt) {
                  // Convert to Date if possible
                  notification.createdAt = new Date(notification.createdAt);
                }

                console.log('✅ Adding new notification to state, total: ' + (prev.length + 1));

                // Sort notifications after adding the new one (newest first)
                const updatedNotifications = [notification, ...prev].sort((a, b) => {
                  const dateA = new Date(a.createdAt);
                  const dateB = new Date(b.createdAt);
                  return dateB.getTime() - dateA.getTime();
                });

                console.log(
                  `Total: ${updatedNotifications.length} notifications, including ${
                    updatedNotifications.filter(n => !n.isRead).length
                  } unread`
                );

                return updatedNotifications;
              });
              setLastUpdate(new Date());
            }
            // For other non-system messages, refresh all notifications
            else if (data.type !== 'connection' && data.type !== 'heartbeat') {
              console.log('🔄 Refreshing notifications due to event:', data.type);
              refreshNotifications();
            }
          } catch (error) {
            console.error('❌ Error processing SSE notification:', error);
          }
        };

        // Handle connection errors
        newEventSource.onerror = error => {
          console.error('❌ SSE connection error:', error);
          isConnected = false;

          // Close and retry connection after a delay with exponential backoff
          newEventSource.close();

          // Only retry if we haven't exceeded max attempts
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;

            // Exponential backoff - start with 1s, then 2s, 4s, etc. up to 30s max
            const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 30000);

            console.log(
              `🔄 Will retry SSE connection in ${delay / 1000}s (attempt ${reconnectAttempts}/${maxReconnectAttempts})`
            );

            // Clear any existing timer
            if (reconnectTimer) {
              clearTimeout(reconnectTimer);
            }

            // Set new reconnect timer
            reconnectTimer = setTimeout(() => {
              if (userId) {
                console.log(
                  `🔄 Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`
                );
                const newSource = createEventSource();
                setEventSource(newSource);
              }
            }, delay);
          } else {
            console.error(
              `❌ Maximum reconnection attempts (${maxReconnectAttempts}) reached. Giving up.`
            );
            // Refresh notifications manually as a fallback
            refreshNotifications();
          }
        };

        return newEventSource;
      } catch (error) {
        console.error('❌ Failed to create EventSource:', error);
        return null;
      }
    };

    // Create the initial EventSource
    const newEventSource = createEventSource();
    if (newEventSource) {
      setEventSource(newEventSource);
    }

    // Cleanup function to close connection when component unmounts
    return () => {
      console.log('🛑 Cleaning up SSE connection');
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [userId]);

  // Load initial notifications
  useEffect(() => {
    if (userId && initialNotifications.length === 0) {
      // If no initial notifications, fetch from server
      refreshNotifications();
    } else if (initialNotifications.length > 0) {
      // If we have initial server-side loaded notifications, sort them before setting
      const sortedInitialNotifications = [...initialNotifications].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      console.log(
        `Setting ${sortedInitialNotifications.length} initial notifications, including ${
          sortedInitialNotifications.filter(n => !n.isRead).length
        } unread`
      );

      setNotifications(sortedInitialNotifications);
      setLastUpdate(new Date());
    }
  }, [userId, initialNotifications.length]);

  const value = {
    notifications,
    refreshNotifications,
    loading,
    lastUpdate,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
