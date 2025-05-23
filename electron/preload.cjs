const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    onWindowStateChange: (callback) => {
      ipcRenderer.on('window-state-changed', (_, maximized) => callback(maximized));
    },
    
    showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),
    scheduleNotification: (id, title, body, delay) => 
      ipcRenderer.send('schedule-notification', { id, title, body, delay }),
    cancelNotification: (id) => ipcRenderer.send('cancel-notification', { id }),
  }
); 