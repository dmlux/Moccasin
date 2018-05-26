// create-react-app my-app --scripts-version=react-scripts-ts-electron

import { app, BrowserWindow, ipcMain } from "electron";
// import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import * as path from "path";
import * as url from "url";

let mainWindow: Electron.BrowserWindow | null;

function createWindow(): void {
  const ENV = process.env.NODE_ENV || "production";
  const PROTOCOL = process.env.HTTPS === "true" ? "https" : "http";
  const PORT = parseInt(process.env.PORT || "", 10) || 3000;
  const HOST = process.env.HOST || "127.0.0.1";

  const appUrl =
    ENV !== "production"
      ? `${PROTOCOL}://${HOST}:${PORT}`
      : url.format({
          pathname: path.join(__dirname, "..", "app", "index.html"),
          protocol: "file:",
          slashes: true,
        });

  mainWindow = new BrowserWindow({
    height: 700,
    minHeight: 600,
    minWidth: 800,
    titleBarStyle: "hidden",
    webPreferences: {
      experimentalFeatures: true,
    },
    width: 1100,
  });

  mainWindow.loadURL(appUrl);
  mainWindow.on("closed", () => (mainWindow = null));
  // mainWindow.maximize();

  app.setAboutPanelOptions({
    applicationName: "Mocassine",
    applicationVersion: "0.0.1",
  });

  // if (ENV !== "production") {
  //   installExtension(REACT_DEVELOPER_TOOLS)
  //     .then((name) => console.log(`Added Extension:  ${name}`))
  //     .catch((err) => console.log("An error occurred: ", err));
  // }
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// ====================================================================

ipcMain.on("window-minimize", () => {
  if (mainWindow !== null) {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.minimize();
    }
  }
});

ipcMain.on("window-maximize", () => {
  if (mainWindow !== null) {
    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    } else {
      mainWindow.setFullScreen(true);
    }
  }
});

ipcMain.on("window-close", () => {
  if (mainWindow !== null) {
    mainWindow.close();
  }
});
