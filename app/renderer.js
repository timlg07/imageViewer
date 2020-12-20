const { remote, ipcRenderer } = require("electron");
const path = require("path");
const loadImage = require("blueimp-load-image");

const supportedExtensions = [
    "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"
];

let imageContainer, imageCanvas, images, fileNames, baseTitle
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

function scaleCanvas(runtwice = true) {
    const containerRect = imageContainer.getBoundingClientRect();
    const availableWidth  = containerRect.width;
    const availableHeight = containerRect.height;
    const imageWidth  = imageCanvas.width;
    const imageHeight = imageCanvas.height;

    // console.log(`available space: h=${availableHeight}, w=${availableWidth}`);

    let scalingRatio = availableWidth / imageWidth;
    let scaledHeight = imageHeight * scalingRatio;

    if (scaledHeight > availableHeight) {
        scalingRatio = availableHeight / imageHeight;
        scaledHeight = imageHeight * scalingRatio;
    }

    let scaledWidth = imageWidth * scalingRatio;

    imageCanvas.style.width  = scaledWidth  + "px";
    imageCanvas.style.height = scaledHeight + "px";

    /* 
     * Run the scaling twice by default, because often the first time 
     * wrong dimensions for the container are reported. 
     * 
     * Example scenerio: The height is 618. The user changes only the width,
     * leaving the height as is. At the first call always a wrong height of
     * 601 is reported, which results in a too small image. At the second call
     * always the correct height of 618 is returned and everything works as
     * expected.
     * 
     * TODO: Find out why this is happening. 
     */
    if (runtwice) scaleCanvas(false);
}

function loadCurrentImage() {
    loadImage(images[currentImageIndex], {
        orientation: true,
        canvas: true
    }).then(data => {
        if (imageCanvas) {
            /* Remove the last image canvas from the DOM. */
            imageContainer.removeChild(imageCanvas);
        } else {
            /* On the first load, register the scaler. */
            window.addEventListener("resize", scaleCanvas);
        }

        imageCanvas = data.image;
        
        /* 
         * It is important to scale the image before adding it to the DOM,
         * because when adding it first, the container would be smaller due
         * to the scrollbars added.
         */
        scaleCanvas();

        imageContainer.appendChild(data.image);

        const currentTitle = baseTitle + ": " + fileNames[currentImageIndex];
        window.customTitlebar.updateTitle(currentTitle);
    });
}

function switchImage(newIndex) {
    if (newIndex < images.length && newIndex >= 0) {
        currentImageIndex = newIndex;
        loadCurrentImage();
    }
}