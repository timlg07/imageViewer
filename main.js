const { app, BrowserWindow, screen, globalShortcut } = require("electron");
const localShortcut = require('electron-localshortcut');
const path = require("path");

function createWindow() {
    /* Events that will get forwarded to the render process, because they impact the apps appearance. */
    const renderForwardEvents = ['enter-full-screen', 'leave-full-screen'];

    /* Get the screens dimensions to define the apps size relatively to the available space. */
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    /* Create the main browser-window. */
    let win = new BrowserWindow({
        title: "imageViewer",
        icon: "./resources/imageViewer.png",
        frame: false,

        position: "center",
        width:  width  * .75,
        height: height * .75,
        resizable: true,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, "app", "preload.js")
        }
    });

    win.loadFile("app/index.html");

    win.on('closed', () => {
        /* Dereference the main window object when terminated. */
        win = null;
    });

    /* Forwarder logic: Send the events to the render process. */
    renderForwardEvents.forEach(event => {
        win.on(event, () => {
            win.webContents.send(event);
        });
    });

    /* Create a local shortcut as intuitive alternative to F11 for exiting the fullscreen mode. */
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