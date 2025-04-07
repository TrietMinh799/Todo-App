interface ElectronAPI {
  // Window management
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  onWindowStateChange: (callback: (maximized: boolean) => void) => void;

  // Notifications
  showNotification: (title: string, body: string) => void;
  scheduleNotification: (id: string, title: string, body: string, delay: number) => void;
  cancelNotification: (id: string) => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export { };