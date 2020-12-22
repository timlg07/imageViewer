const { remote, ipcRenderer } = require("electron");
const path = require("path");
const loadImage = require("blueimp-load-image");

const supportedExtensions = [
    "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"
];

let imageContainer, imageCanvas, images, fileNames, baseTitle,
    useCanvas = false, currentImageIndex = 0;

window.addEventListener('load', () => {
    baseTitle = document.title;
    imageContainer = document.getElementById("image-container");
    images = remote.process.argv.filter(isImage);
    fileNames = images.map(v => path.basename(v));
    images = images.map(slash).map(encodeChars);
    updateSwitchImageMenuItems();
    loadCurrentImage();

    const useCanvasCheckmark = remote.Menu.getApplicationMenu().items[1].submenu.items[2];
    const channelListeners = {
        'switchToNextImage' : () => switchImage(currentImageIndex + 1),
        'switchToPrevImage' : () => switchImage(currentImageIndex - 1),
        'toggleCanvasMode'  : (_, state) => {
            /**
             * Only god knows why this has to be done from the render process and produces 
             * completely weird and variating results when done directly in the click listener
             * of the menu item.
             */
            //useCanvasCheckmark.checked = state;
            useCanvas = state;
            loadCurrentImage();
        }
    };
    Object.keys(channelListeners).forEach(key => {
        ipcRenderer.on(key, channelListeners[key]);
    });
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
    }).catch(r => {
        updateTitle("Error loading the image.");
    });
}

function switchImage(newIndex) {
    if (fileIndexInRange(newIndex)) {
        currentImageIndex = newIndex;
        updateSwitchImageMenuItems();
        loadCurrentImage();
    }
}

function updateSwitchImageMenuItems() {
    const items = remote.Menu.getApplicationMenu().items[0].submenu.items;
    items[0].enabled = fileIndexInRange(currentImageIndex + 1);
    items[1].enabled = fileIndexInRange(currentImageIndex - 1);
}

function fileIndexInRange(index) {
    return (index >= 0) && (index < images.length);
}

function updateTitle(titleMessage) {
    const seperator = " ─ ";
    const newTitle = baseTitle + seperator + titleMessage;
    window.customTitlebar.updateTitle(newTitle);
}