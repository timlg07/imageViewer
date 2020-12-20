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
                    accelerator: '>'
                },
                { 
                    label: 'Previous Image',
                    click: () => switchImage(currentImageIndex - 1),
                    accelerator: '<'
                },
                { type: 'separator' },
                { role: isMac ? 'close' : 'quit' }
            ]
        }));

        menu.append(new remote.MenuItem({
            label: 'View',
            submenu: [
                { role: 'togglefullscreen', label: 'Fullscreen (Exit with escape)' }
            ]
        }));

        return menu;
    }
}