const { remote, ipcRenderer } = require("electron");
const path = require("path");
const loadImage = require("blueimp-load-image");

const supportedExtensions = [
    "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"
];

let imageContainer, imageCanvas, images, fileNames, baseTitle,
    currentImageIndex = 0;

window.addEventListener('load', () => {
    baseTitle = document.title;
    imageContainer = document.getElementById("image-container");
    images = remote.process.argv.filter(isImage);
    fileNames = images.map(v => path.basename(v));
    images = images.map(slash).map(encodeChars);
    loadCurrentImage();
});

ipcRenderer.on("nextImage", () => switchImage(currentImageIndex + 1));
ipcRenderer.on("prevImage", () => switchImage(currentImageIndex - 1));
ipcRenderer.on("toggleCanvas", () => {
    useCanvas = !useCanvas;
    loadCurrentImage();
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

function scaleCanvas() {
    const containerRect = imageContainer.getBoundingClientRect();
    const availableWidth  = containerRect.width;
    const availableHeight = containerRect.height;
    const imageWidth  = imageCanvas.width;
    const imageHeight = imageCanvas.height;

    let scalingRatio = availableWidth / imageWidth;
    let scaledHeight = imageHeight * scalingRatio;

    if (scaledHeight > availableHeight) {
        scalingRatio = availableHeight / imageHeight;
        scaledHeight = imageHeight * scalingRatio;
    }

    let scaledWidth = imageWidth * scalingRatio;

    imageCanvas.style.width  = scaledWidth  + "px";
    imageCanvas.style.height = scaledHeight + "px";
}

function loadCurrentImage() {
    updateTitle("Loading.");

    loadImage(images[currentImageIndex], {
        orientation: true,
        canvas: useCanvas
    }).then(data => {
        if (imageCanvas) {
            /* Remove the last image canvas from the DOM. */
            imageContainer.removeChild(imageCanvas);
        } else {
            /* On the first load, register the scaler. */
            window.addEventListener("resize", scaleCanvas);
        }

        imageCanvas = data.image;
        scaleCanvas();

        imageContainer.appendChild(data.image);
        updateTitle(fileNames[currentImageIndex]);
    });
}

function switchImage(newIndex) {
    if (newIndex < images.length && newIndex >= 0) {
        currentImageIndex = newIndex;
        loadCurrentImage();
    }
}

function updateTitle(titleMessage) {
    const seperator = " ─ ";
    const newTitle = baseTitle + seperator + titleMessage;
    window.customTitlebar.updateTitle(newTitle);
}