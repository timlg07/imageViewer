const { Titlebar, Themebar } = require('custom-electron-titlebar');
const { createMenu } = require("./titlebar/menubar");

window.addEventListener('DOMContentLoaded', () => {
    /* Decide the theme based on the current operating system. */
    const isWin = (process.platform === "win32");
    const theme = isWin ? Themebar.win : Themebar.mac;

    /* Create a new custom titlebar. */
    new Titlebar({
        menu: createMenu(),
        iconsTheme: theme,
        icon: "./../resources/imageViewer.png"
    });
});