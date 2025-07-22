import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    title: "Mini Discord",
    width: 1000,
    height: 700,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.setMenuBarVisibility(false);
    win.loadFile(path.join(__dirname, 'index.html'));
  }
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.minidiscord');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
