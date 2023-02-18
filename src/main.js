const { app, BrowserWindow, ipcMain} = require('electron');
const Store = require('electron-store');

let store = new Store();
ipcMain.on('save-server-url', (event, arg) => {
  store.set('server-url', arg);
});
ipcMain.on("get-server-url", (event) => {
  event.sender.send("server-url", store.get('server-url'));
});

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: true,
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: false,
      nodeIntegration: true
    },
  });
  let splash = new BrowserWindow({width: 800, height: 600, transparent: true, frame: false, alwaysOnTop: true});
  splash.loadURL(`file://${__dirname}/splash.html`);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY + '#login');
  mainWindow.once('ready-to-show', () => {
    splash.destroy();
    mainWindow.show();
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});