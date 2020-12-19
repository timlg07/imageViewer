const { remote } = require("electron");

module.exports = {
    createMenu() {
        const isMac = (process.platform === "darwin");
        const menu = new remote.Menu();

        menu.append(new remote.MenuItem({
            label: 'File',
            submenu: [
                { role: isMac ? 'close' : 'quit' }
            ]
        }));

        menu.append(new remote.MenuItem({
            label: 'View',
            submenu: [
                { role: 'togglefullscreen', label: 'Fullscreen (Exit with escape)' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
            ]
        }));

        return menu;
    }
}