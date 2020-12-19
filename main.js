const { app, BrowserWindow, screen, globalShortcut } = require("electron");
const { stat } = require("fs");
const path = require("path");

let win;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const renderForwardEvents = ['enter-full-screen', 'leave-full-screen'];

    win = new BrowserWindow({
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

    globalShortcut.register("escape", () => win.setFullScreen(false));
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