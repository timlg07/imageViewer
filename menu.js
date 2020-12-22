const { BrowserWindow, global, Menu } = require('electron');

const isMac = (process.platform === "darwin");
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
                label: 'File',
                submenu: [
                    { 
                        label: 'Next Image',
                        click: () => win.webContents.send(channels.next),
                        accelerator: 'Right'
                    },
                    { 
                        label: 'Previous Image',
                        click: () => win.webContents.send(channels.prev),
                        accelerator: 'Left'
                    },
                    { type: 'separator' },
                    { role: isMac ? 'close' : 'quit' }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { role: 'togglefullscreen', label: 'Fullscreen (exit with esc, toggle with F)' },
                    { type: 'separator' },
                    { 
                        type: 'checkbox', 
                        label: 'Use Canvas for more detail and sharpness.',
                        accelerator: 'D',
                        checked: false,
                        click: (function(initialValue) {
                            let trackerValue = initialValue;
                            return (function(item) {
                                const expected = trackerValue;
                                const actual = item.checked;
                                console.log(`expected:${expected}, actual:${actual}`);
                                win.webContents.send(channels.canv, !expected);
                                item.checked = expected;
                                trackerValue = !trackerValue;
                            });
                        })(false)
                        /*
                        checked: false,
                        click: (() => {
                            let useCanvas = false;
                            return item => {//problem: item.checked is inversed when using the accelerator. wtf.
                                console.log(`initial: expected:${useCanvas}, actual:${!item.checked}`);
                                useCanvas = !useCanvas;
                                win.webContents.send(channels.canv, item.checked);
                                item.checked = !item.checked;
                                console.log(`inverted: expected:${useCanvas}, actual:${!item.checked}\n`);
                            }
                        })()*/

                        /**
                         * ok
                         * clicking on the item does not toggle its checked property. still showing default value (false).
                         * 
                         * using the accelerator does toggle the checked property and inverses the checkmark.
                         * 
                         * help.
                         */
                    },
                    { role: 'toggleDevTools' }
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
    },

    /**
     * Generates the template, builds a menu from it and applies it to the given window.
     * 
     * @param {BrowserWindow} win 
     */
    generateAndApply(win) {
        win.setMenu(this.generateMenu(win));
    }
}