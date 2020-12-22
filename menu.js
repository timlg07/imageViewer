const { BrowserWindow, Menu } = require('electron');

const isMac = (process.platform === 'darwin');
const channels = {
    next: 'switchToNextImage',
    prev: 'switchToPrevImage',
    canv: 'toggleCanvasMode'
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
                    { type: "separator" },
                    { 
                        type: "checkbox", 
                        label: "Use Canvas for more detail and sharpness.",
                        accelerator: 'D',
                        checked: false,
                        click: () => win.webContents.send(channels.canv)
                    },
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