const { Titlebar, Themebar } = require('custom-electron-titlebar');
const { remote, ipcRenderer, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const loadImage = require('blueimp-load-image');

window.addEventListener('DOMContentLoaded', () => {
    /* Decide the theme based on the current operating system. */
    const isWin = (process.platform === 'win32');
    const theme = isWin ? Themebar.win : Themebar.mac;

    /* Create a new custom titlebar. */
    const customTitlebar = new Titlebar({
        iconsTheme: theme,
        icon: "./../resources/imageViewer.png",
        shadow: true
    });

    const baseTitle = document.title;
    const supportedExtensions = [
        "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"
    ];

    const util = {
        get arguments() {
            return remote.process.argv;
        },

        updateTitle(titleMessage) {
            const seperator = " ─ ";
            const newTitle = baseTitle + seperator + titleMessage;
            customTitlebar.updateTitle(newTitle);
        },

        get applicationMenu() {
            return remote.Menu.getApplicationMenu();
        },

        getFileName(filepath) {
            return path.basename(filepath);
        },

        handleSlashes(str) {
            return str.replace(/\\/g, "/");
        },
        
        encodeChars(str) {
            return str.replace(/['()# ]/g, c => ("%" + c.charCodeAt(0).toString(16)));
        },
        
        isImage(filepath) {
            /* Get the extension of the file, remove the leading dot and force only lowercase characters. */
            const ext = path.extname(filepath).slice(1).toLowerCase();
            return ext && supportedExtensions.indexOf(ext) >= 0;
        },

        getAllFilesInSameDir(filepath) {
            const dirpath = this.getAbsolutePath(path.dirname(filepath));
            const filenames = fs.readdirSync(dirpath);
            const absolutPaths = filenames.map(f => path.resolve(dirpath, f));
            return absolutPaths;
        },

        getAbsolutePath(filepath) {
            return path.resolve(__dirname, filepath);
        },

        writeImgToClipboard(img) {
            clipboard.writeImage(img);
        },

        loadImage: loadImage,
        ipcRenderer: ipcRenderer
    }

    const utilReadyEvent = new CustomEvent('util-ready', {detail: {
        util: util
    }});

    window.dispatchEvent(utilReadyEvent);
});