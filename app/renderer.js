window.addEventListener('view-ready', event => {
    const { util, view } = event.detail;

    function loadCurrentImage() {
        util.updateTitle("Loading.");
        util.loadImage(images[currentImageIndex], {
            orientation: true,
            canvas: useCanvas
        }).then(data => {
            view.displayedImage = data.image;
            currentImageHeight = data.originalHeight;
            currentImageWidth = data.originalWidth;
            scaleCanvas();
            util.updateTitle(fileNames[currentImageIndex]);
        }).catch(r => {
            view.displayedImage = null;
            util.updateTitle("Error loading the image.");
        });
    }

    function scaleCanvas() {
        /* No calculation if no image is displayed currently. */
        if (view.displayedImage == null) return;

        const containerRect = view.imageContainerBoundingRect;
        const availableWidth  = containerRect.width;
        const availableHeight = containerRect.height;
    
        let scalingRatio = availableWidth / currentImageWidth;
        let scaledHeight = currentImageHeight * scalingRatio;
    
        if (scaledHeight > availableHeight) {
            scalingRatio = availableHeight / currentImageHeight;
            scaledHeight = currentImageHeight * scalingRatio;
        }
    
        let scaledWidth = currentImageWidth * scalingRatio;
    
        view.displayedImage.style.width  = scaledWidth  + "px";
        view.displayedImage.style.height = scaledHeight + "px";
    }

    function scanFiles(files) {
        const supportedFiles = files.filter(util.isImage);
        const fileNames = supportedFiles.map(v => util.getFileName(v));
        const fileURLs  = supportedFiles.map(util.handleSlashes).map(util.encodeChars);

        return {
            names: fileNames,
            urls: fileURLs
        };
    }
    
    function switchImage(newIndex) {
        if (fileIndexInRange(newIndex)) {
            currentImageIndex = newIndex;
            updateNextPrevMenuItems();
            loadCurrentImage();
        }
    }

    function updateNextPrevMenuItems() {
        const prevInRange = fileIndexInRange(currentImageIndex - 1);
        const nextInRange = fileIndexInRange(currentImageIndex + 1);
        view.updateNextPrevMenuItems(prevInRange, nextInRange);
    }
    
    function fileIndexInRange(index) {
        return (index >= 0) && (index < images.length);
    }


    let images, fileNames,
        useCanvas = false, 
        currentImageIndex  = 0,
        currentImageWidth  = 0,
        currentImageHeight = 0;

    const supportedFilesFromArguments = scanFiles(util.arguments);
    images = supportedFilesFromArguments.urls;
    fileNames = supportedFilesFromArguments.names;

    updateNextPrevMenuItems();
    loadCurrentImage();

    window.addEventListener('resize', scaleCanvas);

    const channelListeners = {
        'switchToNextImage' : () => switchImage(currentImageIndex + 1),
        'switchToPrevImage' : () => switchImage(currentImageIndex - 1),
        'toggleCanvasMode'  : () => {
            useCanvas = !useCanvas;

            // Manually toggle the visual checkmark in the menu:
            view.useCanvas = useCanvas;

            loadCurrentImage();
        }
    };

    Object.keys(channelListeners).forEach(key => {
        util.ipcRenderer.on(key, channelListeners[key]);
    });
});