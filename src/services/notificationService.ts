import { Reminder, ReminderTime } from '../components/ReminderSettings';

// Define the notification API
declare global {
  interface Window {
    electron?: {
      showNotification: (title: string, body: string) => void;
      scheduleNotification: (id: string, title: string, body: string, delay: number) => void;
      cancelNotification: (id: string) => void;
    };
  }
}

class NotificationService {
  private static instance: NotificationService;
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Schedule a notification for a todo item
   */
  public scheduleReminder(
    todoId: string,
    todoText: string,
    dueDate: string | null,
    reminder: Reminder
  ): void {
    if (!reminder.enabled || !dueDate) {
      return;
    }

    // Cancel any existing notification for this todo
    this.cancelReminder(todoId);

    // Calculate the notification time based on the reminder settings
    const dueDateTime = new Date(dueDate);
    const now = new Date();
    
    // If the due date is in the past, don't schedule a reminder
    if (dueDateTime < now) {
      return;
    }

    let delayInMinutes = 0;
    
    switch (reminder.time) {
      case '5min':
        delayInMinutes = 5;
        break;
      case '15min':
        delayInMinutes = 15;
        break;
      case '30min':
        delayInMinutes = 30;
        break;
      case '1hour':
        delayInMinutes = 60;
        break;
      case '1day':
        delayInMinutes = 24 * 60;
        break;
      case 'custom':
        delayInMinutes = reminder.customTime || 30;
        break;
    }

    // Calculate the notification time
    const notificationTime = new Date(dueDateTime.getTime() - delayInMinutes * 60 * 1000);
    
    // If the notification time is in the past, don't schedule
    if (notificationTime < now) {
      return;
    }

    // Calculate delay in milliseconds
    const delayInMs = notificationTime.getTime() - now.getTime();

    // Create a unique ID for this notification
    const notificationId = `todo-${todoId}-${Date.now()}`;

    // Schedule the notification
    if (window.electron?.scheduleNotification) {
      // Use the electron API if available
      window.electron.scheduleNotification(
        notificationId,
        'Todo Reminder',
        `Reminder: "${todoText}" is due in ${this.formatTimeRemaining(delayInMinutes)}`,
        delayInMs
      );
    } else {
      // Fallback to setTimeout for web
      const timeout = setTimeout(() => {
        this.showNotification('Todo Reminder', `Reminder: "${todoText}" is due in ${this.formatTimeRemaining(delayInMinutes)}`);
      }, delayInMs);
      
      this.scheduledNotifications.set(notificationId, timeout);
    }
  }

  /**
   * Cancel a scheduled reminder
   */
  public cancelReminder(todoId: string): void {
    // Find all notifications for this todo
    for (const [id, timeout] of this.scheduledNotifications.entries()) {
      if (id.startsWith(`todo-${todoId}-`)) {
        clearTimeout(timeout);
        this.scheduledNotifications.delete(id);
        
        // Also cancel via electron API if available
        if (window.electron?.cancelNotification) {
          window.electron.cancelNotification(id);
        }
      }
    }
  }

  /**
   * Show a notification immediately
   */
  public showNotification(title: string, body: string): void {
    if (window.electron?.showNotification) {
      window.electron.showNotification(title, body);
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }

  /**
   * Format the time remaining in a human-readable format
   */
  private formatTimeRemaining(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes < 24 * 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / (24 * 60));
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
  }
}

export const notificationService = NotificationService.getInstance(); 