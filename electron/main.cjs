const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

// Define mainWindow in the global scope
let mainWindow = null;

// Store scheduled notifications
const scheduledNotifications = new Map();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (error) {
  // Module not found or other error, continue without it
  console.log('electron-squirrel-startup not available');
}

function createWindow() {
  // Change from const to using the global variable
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    titleBarStyle: 'hidden',
  });

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' http://localhost:*;",
          "script-src 'self' 'unsafe-inline' http://localhost:*;",
          "style-src 'self' 'unsafe-inline' http://localhost:*;",
          "img-src 'self' data: http://localhost:*;",
          "connect-src 'self' http://localhost:*;",
          "worker-src 'self' blob:;",
          "child-src 'self' blob:;"
        ].join(' ')
      }
    });
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window state changes
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-state-changed', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-state-changed', false);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Window control handlers
ipcMain.on('minimize-window', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.minimize();
});

ipcMain.on('maximize-window', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.close();
});

// Notification handlers
ipcMain.on('show-notification', (_, { title, body }) => {
  new Notification({ title, body }).show();
});

ipcMain.on('schedule-notification', (_, { id, title, body, delay }) => {
  // Cancel any existing notification with the same ID
  if (scheduledNotifications.has(id)) {
    clearTimeout(scheduledNotifications.get(id));
    scheduledNotifications.delete(id);
  }

  // Schedule the new notification
  const timeout = setTimeout(() => {
    new Notification({ title, body }).show();
    scheduledNotifications.delete(id);
  }, delay);

  scheduledNotifications.set(id, timeout);
});

ipcMain.on('cancel-notification', (_, { id }) => {
  if (scheduledNotifications.has(id)) {
    clearTimeout(scheduledNotifications.get(id));
    scheduledNotifications.delete(id);
  }
}); 