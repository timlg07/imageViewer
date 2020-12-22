const { Titlebar, Themebar } = require('custom-electron-titlebar');

window.addEventListener('DOMContentLoaded', () => {
    /* Decide the theme based on the current operating system. */
    const isWin = (process.platform === "win32");
    const theme = isWin ? Themebar.win : Themebar.mac;

    /* Create a new custom titlebar. */
    window.customTitlebar = new Titlebar({
        iconsTheme: theme,
        icon: "./../resources/imageViewer.png",
        shadow: true
    });
});