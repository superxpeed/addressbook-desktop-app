const { app, BrowserWindow } = require('electron');

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
      webSecurity: false
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