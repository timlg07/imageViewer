const { remote, ipcRenderer } = require("electron");

module.exports = {
    createMenu() {
        const menu = new remote.Menu();
        
        menu.append(new remote.MenuItem({
            label: 'File',
            submenu: [
                {
                    label: 'Exit',
                    click: () => ipcRenderer.send("quit")
                }
            ]
        }));

        return menu;
    }
}