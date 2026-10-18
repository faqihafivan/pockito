/**
 * Pockito Reminder Service
 * Encapsulates browser notification capabilities and in-app reminder scheduling.
 * Note: Background native push notifications are reserved for Capacitor Android plugins.
 */

export interface InAppAlert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export class ReminderService {
  private static alerts: InAppAlert[] = [];
  private static listeners: ((alerts: InAppAlert[]) => void)[] = [];

  static isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  static getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isNotificationSupported()) return 'unsupported';
    return Notification.permission;
  }

  static async requestPermission(): Promise<boolean> {
    if (!this.isNotificationSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  static triggerNotification(title: string, body: string): void {
    // 1. Add to in-app notification drawer
    const alert: InAppAlert = {
      id: 'alert-' + Date.now(),
      title,
      message: body,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    this.alerts = [alert, ...this.alerts];
    this.notifyListeners();

    // 2. Dispatch browser notification if permitted
    if (this.isNotificationSupported() && Notification.permission === 'granted') {
      try {
        new Notification(`Pockito: ${title}`, {
          body,
          icon: '/vite.svg',
        });
      } catch (err) {
        console.warn('Web notification dispatch failed:', err);
      }
    }
  }

  static subscribe(listener: (alerts: InAppAlert[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.alerts);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach((l) => l(this.alerts));
  }

  static getAlerts(): InAppAlert[] {
    return [...this.alerts];
  }

  static clearAlerts(): void {
    this.alerts = [];
    this.notifyListeners();
  }
}
