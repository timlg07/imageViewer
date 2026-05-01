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
            const sortedFilenames = filenames.sort((a, b) => {
                // check if both filenames are only containing numbers
                const aIsNumber = /^\d+\.[^.]+$/.test(a);
                const bIsNumber = /^\d+\.[^.]+$/.test(b);
                // if both are numbers, sort them numerically
                if (aIsNumber && bIsNumber) {
                    return parseInt(a) - parseInt(b);
                }
                // normal string comparison
                return a.localeCompare(b);
            });
            const absolutPaths = sortedFilenames.map(f => path.resolve(dirpath, f));
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
        ,
        moveToTrash(filepath) {
            try {
                const folder = path.dirname(filepath);
                const trashDir = path.join(folder, 'trash');
                if (!fs.existsSync(trashDir)) {
                    fs.mkdirSync(trashDir, { recursive: true });
                }

                const filename = path.basename(filepath);
                let dest = path.join(trashDir, filename);
                // If file exists in trash, append timestamp to avoid collision
                if (fs.existsSync(dest)) {
                    const ts = Date.now();
                    dest = path.join(trashDir, `${ts}_${filename}`);
                }

                fs.renameSync(filepath, dest);
                return { ok: true, dest };
            } catch (err) {
                return { ok: false, error: err && err.message ? err.message : String(err) };
            }
        }
    }

    const utilReadyEvent = new CustomEvent('util-ready', {detail: {
        util: util
    }});

    window.dispatchEvent(utilReadyEvent);
});