interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  onWindowStateChange: (callback: (maximized: boolean) => void) => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {}; 