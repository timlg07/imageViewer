const customTitlebar = require('custom-electron-titlebar');

window.addEventListener('DOMContentLoaded', () => {
    new customTitlebar.Titlebar();
});