const { app, BrowserWindow, screen, Menu } = require("electron");
const localShortcut = require('electron-localshortcut');
const path = require("path");
const menu = require("./menu");

function createWindow() {
    /* Events that will get forwarded to the render process, because they impact the apps appearance. */
    const renderForwardEvents = ['enter-full-screen', 'leave-full-screen'];

    /* Get the screens dimensions to define the apps size relatively to the available space. */
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    /* Create the main browser-window. */
    let win = new BrowserWindow({
        title: "imageViewer",
        icon: path.join(__dirname, "resources", "imageViewer.png"),
        frame: false,

        position: "center",
        width:  width  * .75,
        height: height * .75,
        minWidth: 180,
        minHeight: 100,
        resizable: true,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, "app", "preload.js")
        }
    });

    // Set the application window, because this is used by the custom-titlebar.
    Menu.setApplicationMenu(menu.generateMenu(win));

    win.loadFile(path.join(__dirname, "app", "index.html"));

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

    /* Create a local shortcuts as intuitive alternatives to F11 for toggling or exiting the fullscreen mode. */
    localShortcut.register(win, "Escape", () => win.setFullScreen(false));
    localShortcut.register(win, "F", () => win.setFullScreen(!win.isFullScreen()));
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