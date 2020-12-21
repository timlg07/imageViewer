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
    loadImage(images[currentImageIndex], {
        orientation: true,
        canvas: true,
        imageSmoothingQuality: 'high'
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
/**
 * Replaces the displayed canvas on the DOM with the new one
 * and saves it in the global imageCanvas object.
 * 
 * @param {Node} newCanvas The new canvas that should be used.
 * @param {boolean} isScaled Whether the provided canvas has 
 *                           source resolution or was scaled.
 */
function replaceDisplayedCanvas(newCanvas, isScaled = false) {
    // Remove the current canvas from being displayed in the container.
    if (imageContainer.hasChildNodes()) {
        imageContainer.removeChild(imageContainer.firstChild);
    }

    // There should now be no child nodes in the image container.
    assert(imageContainer.hasChildNodes() == false);

    /*
     * Store the new canvas now, potentially overwriting previously scaled
     * canvases. If a new source image is loaded, all stored images are
     * overwritten.
     */
    if (isScaled) {
        imageCanvas.scaled = newCanvas;
    } else {
        imageCanvas.scaled = null;
        imageCanvas.source = newCanvas;
    }

    // Display the new image canvas.
    imageContainer.appendChild(newCanvas);
}