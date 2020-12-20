const { remote } = require("electron");
const path = require("path");
const fs = require("fs")

const supportedExtensions = [
    "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"
];

window.addEventListener('DOMContentLoaded', () => {
    let inputArgs = remote.process.argv;
    let images = inputArgs.filter(isImage);
    let currentIndex = 0;
    let currentURL = encodeChars(slash(path.normalize(images[currentIndex])));
    const imageElement = document.getElementById("image");
    
    imageElement.style.backgroundImage = `url(${currentURL})`;
});

function slash(str) {
    return str.replace(/\\/g, "/");
}

function encodeChars(str) {
    return str.replace(/['()# ]/g, c => ('%' + c.charCodeAt(0).toString(16)));
}

function isImage(filePath) {
    /* Get the extension of the file, remove the leading dot and force only lowercase characters. */
    const ext = path.extname(filePath).slice(1).toLowerCase();
    return ext && supportedExtensions.indexOf(ext) >= 0;
}
