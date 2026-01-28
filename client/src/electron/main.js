import { app, BrowserWindow } from 'electron';

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      contextIsolation: true
    }
  });

  // Load Vite dev server if running in dev mode
  // build it with: npm run build
  // run dev with: npm run electron:dev
  
  // In a real production app we would check app.isPackaged
  // But here we'll try to load the dev server, and fall back (or just allow logic switch)
  
  // For the user request "run desktop", we want to ensure it works.
  // We'll load the local URL for development.
  win.loadURL("http://localhost:5173");
  
  // Open DevTools in dev mode
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
