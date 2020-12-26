window.addEventListener('view-ready', event => {
    const { util, view } = event.detail;

    function loadImage(imgPath, imgName) {
        util.updateTitle("Loading.");
        util.loadImage(imgPath, {
            orientation: true,
            canvas: useCanvas
        }).then(data => {
            view.displayedImage = data.image;
            currentImageHeight = data.originalHeight;
            currentImageWidth = data.originalWidth;
            scaleCanvas();
            util.updateTitle(imgName);
        }).catch(r => {
            view.displayedImage = null;
            util.updateTitle("Error loading the image.");
        });
    }

    function loadCurrentImage() {
        if (currentImageIndex >= images.length) {
            util.updateTitle("Nothing to view.");
        } else {
            loadImage(
                images[currentImageIndex], 
                fileNames[currentImageIndex]
            );
        }
    }

    function scaleCanvas() {
        if (view.displayedImage == null) {
            return; // No calculation if no image is displayed currently
        } else if (autoFitSize) {
            view.hideImageScrollbars();
            scaleCanvasToContain();
        } else {
            view.showImageScrollbars();
        }

        applyCanvasScaling();
    }

    function scaleCanvasToContain() {
        const containerRect = view.imageContainerBoundingRect;
        const availableWidth  = containerRect.width;
        const availableHeight = containerRect.height;
    
        let scalingRatio = availableWidth / currentImageWidth;
        let scaledHeight = currentImageHeight * scalingRatio;
    
        if (scaledHeight > availableHeight) {
            scalingRatio = availableHeight / currentImageHeight;
        }

        currentCanvasScale = scalingRatio;
    }

    function applyCanvasScaling() {
        view.displayedImage.style.width  = (currentImageWidth  * currentCanvasScale) + "px";
        view.displayedImage.style.height = (currentImageHeight * currentCanvasScale) + "px";
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
        autoFitSize = true,
        currentCanvasScale = 1,
        currentImageIndex  = 0,
        currentImageWidth  = 0,
        currentImageHeight = 0;

    (function parseArguments() {
        const supportedFilesFromArguments = scanFiles(util.arguments);
        images = supportedFilesFromArguments.urls;
        fileNames = supportedFilesFromArguments.names;
    })();

    updateNextPrevMenuItems();
    loadCurrentImage();

    window.addEventListener('resize', scaleCanvas);

    const channelListeners = {
        switchToNextImage() {
            switchImage(currentImageIndex + 1);
        },

        switchToPrevImage() {
            switchImage(currentImageIndex - 1);
        },
        
        toggleCanvasMode() {
            useCanvas = !useCanvas;

            // Manually toggle the visual checkmark in the menu:
            view.useCanvas = useCanvas;

            loadCurrentImage();
        },

        setSizeToSource() {
            autoFitSize = false;
            currentCanvasScale = 1;
            scaleCanvas();
        },

        setSizeToFitWin() {
            autoFitSize = true;
            scaleCanvas();
        },

        zoomIn() {
            autoFitSize = false;
            currentCanvasScale += .02;
            scaleCanvas();
        },
        
        zoomOut() {
            autoFitSize = false;
            currentCanvasScale -= .02;
            scaleCanvas();
        }
    };

    Object.keys(channelListeners).forEach(key => {
        util.ipcRenderer.on(key, channelListeners[key]);
    });
});