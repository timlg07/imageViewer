const { Titlebar, Themebar } = require('custom-electron-titlebar');
const { createMenu } = require("./menubar");

window.addEventListener('DOMContentLoaded', () => {
    const isWin = (process.platform === "win32");
    const theme = isWin ? Themebar.win : Themebar.mac;

    new Titlebar({
        menu: createMenu(),
        iconsTheme: theme,
        icon: "./../resources/imageViewer.png"
    });
});