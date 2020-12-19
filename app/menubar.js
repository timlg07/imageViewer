const { remote, ipcRenderer } = require("electron");

module.exports = {
    createMenu() {
        const menu = new remote.Menu();

        menu.append(new remote.MenuItem({
            label: 'File',
            submenu: [
                { role: "quit" },
            ]
        }));

        menu.append(new remote.MenuItem({
            label: 'View',
            submenu: [
                { role: 'togglefullscreen' }
            ]
        }))

        return menu;
    }
}