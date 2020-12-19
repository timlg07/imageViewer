const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    let win = new BrowserWindow({
        title: "imageViewer",
        icon: "resources/imageViewer.png",
        position: "center",
        width: width / 2,
        x: width / 4,
        height: height / 2,
        y: height / 4,
        resizable: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, "app", "preload.js")
        }
    });

    win.loadFile("app/index.html");

    win.on('closed', () => {
        win = null;
    });
}

app.whenReady().then(createWindow);

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