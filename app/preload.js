const customTitlebar = require('custom-electron-titlebar');
const { createMenu } = require("./menubar");

window.addEventListener('DOMContentLoaded', () => {
    new customTitlebar.Titlebar({
        menu: createMenu(),
        titleHorizontalAlignment: "center",
        unfocusEffect: false
    });
});