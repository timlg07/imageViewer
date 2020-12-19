const { app, BrowserWindow, screen, globalShortcut } = require("electron");
const localShortcut = require('electron-localshortcut');
const path = require("path");

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const renderForwardEvents = ['enter-full-screen', 'leave-full-screen'];

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
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, "app", "preload.js")
        }
    });

    win.loadFile("app/index.html");

    win.on('closed', () => {
        win = null;
    });

    renderForwardEvents.forEach(event => {
        win.on(event, () => {
            win.webContents.send(event);
        });
    });

    localShortcut.register(win, "Escape", () => win.setFullScreen(false));
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