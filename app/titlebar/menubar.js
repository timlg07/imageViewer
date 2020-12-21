const { remote } = require("electron");

module.exports = {
    createMenu() {
        const isMac = (process.platform === "darwin");
        const menu = new remote.Menu();

        menu.append(new remote.MenuItem({
            label: 'File',
            submenu: [
                { 
                    label: 'Next Image',
                    click: () => switchImage(currentImageIndex + 1),
                    accelerator: 'Right'
                },
                { 
                    label: 'Previous Image',
                    click: () => switchImage(currentImageIndex - 1),
                    accelerator: 'Left'
                },
                { type: 'separator' },
                { role: isMac ? 'close' : 'quit' }
            ]
        }));

        menu.append(new remote.MenuItem({
            label: 'View',
            submenu: [
                { role: 'togglefullscreen', label: 'Fullscreen (exit with esc, toggle with F)' },
                { type: 'separator' },
                { 
                    type: 'checkbox', 
                    label: 'Use Canvas for more detail and sharpness.',
                    accelerator: 'D', 
                    checked: useCanvas, 
                    click: item => {
                        useCanvas = !useCanvas;
                        item.checked = useCanvas;
                        loadCurrentImage();
                    }
                },
                { role: 'toggleDevTools' }
            ]
        }));

        remote.Menu.setApplicationMenu(menu);
        return menu;
    }
}