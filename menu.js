const { BrowserWindow, Menu } = require('electron');

const isMac = (process.platform === 'darwin');
const channels = {
    next: 'switchToNextImage',
    prev: 'switchToPrevImage',
    canv: 'toggleCanvasMode',
    size: {
        src: 'setSizeToSource',
        fit: 'setSizeToFitWin',
        zoomIn: 'zoomIn',
        zoomOut: 'zoomOut'
    }
}

module.exports = {

    /**
     * Generates a menu template for the given window.
     * 
     * @param {BrowserWindow} win 
     */
    generateTemplate(win) {
        const template = [
            {
                label: "File",
                submenu: [
                    { 
                        label: "Next Image",
                        click: () => win.webContents.send(channels.next),
                        accelerator: 'Right'
                    },
                    { 
                        label: "Previous Image",
                        click: () => win.webContents.send(channels.prev),
                        accelerator: 'Left'
                    },
                    { type: "separator" },
                    { role: (isMac ? "close" : "quit") }
                ]
            },
            {
                label: "View",
                submenu: [
                    { role: "togglefullscreen", label: "Fullscreen (exit with esc, toggle with F)" },
                    {
                        label: "Zoom",
                        submenu: [
                            {
                                type: "checkbox",
                                label: "Fit in window",
                                click: o => {
                                    o.checked = false; // Setting checked to false sets the checkbox to true, idk why
                                    win.webContents.send(channels.size.fit);
                                },
                                accelerator: "0"
                            },
                            {
                                label: "Original size",
                                click: () => win.webContents.send(channels.size.src),
                                accelerator: "O"
                            },
                            {
                                label: "Zoom in",
                                click: () => win.webContents.send(channels.size.zoomIn),
                                accelerator: "+"
                            },
                            {
                                label: "Zoom out",
                                click: () => win.webContents.send(channels.size.zoomOut),
                                accelerator: "-"
                            }
                        ]
                    },
                    { type: "separator" },
                    { 
                        type: "checkbox", 
                        label: "Use Canvas for more detail and sharpness.",
                        accelerator: 'D',
                        checked: false,
                        click: () => win.webContents.send(channels.canv)
                    },
                    { type: "separator" },
                    { role: "toggleDevTools" }
                ]
            }
        ];

        return template;
    },

    /**
     * Generates the menu template and builds a menu from it.
     * 
     * @param {BrowserWindow} win 
     */
    generateMenu(win) {
        return Menu.buildFromTemplate(this.generateTemplate(win));
    }
}