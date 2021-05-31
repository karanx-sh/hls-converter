const { app, BrowserWindow } = require("electron");
const electron = require("electron");

const path = require("path");

if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const screenElectron = electron.screen;
  const display = screenElectron.getPrimaryDisplay();
  const dimensions = display.workAreaSize;

  const mainWindow = new BrowserWindow({
    width: parseInt(dimensions.width * 0.6),
    height: parseInt(dimensions.height * 0.9),
    minWidth: parseInt(dimensions.width * 0.6),
    minHeight: parseInt(dimensions.height * 1),
    maxWidth: parseInt(dimensions.width * 0.6),
    maxHeight: parseInt(dimensions.height * 1),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      devTools: false,
    },
  });
  mainWindow.setMenu(null);
  mainWindow.loadFile(path.join(__dirname, "index2.html"));

  mainWindow.webContents.openDevTools();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
