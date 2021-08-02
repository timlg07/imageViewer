window.addEventListener('view-ready', event => {
    const { util, view } = event.detail;

    function loadImage(imgPath, imgName) {
        view.updateNextPrevMenuItems(false, false);
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
            updateNextPrevMenuItems();
        }).catch(r => {
            view.displayedImage = null;
            util.updateTitle("Error loading the image.");
            updateNextPrevMenuItems();
        });
    }

    function loadCurrentImage() {
        if (fileIndexInRange(currentImageIndex)) {
            loadImage(
                images[currentImageIndex], 
                fileNames[currentImageIndex]
            );
        } else {
            util.updateTitle("Nothing to view.");
            updateNextPrevMenuItems();
        }
    }

    function scaleCanvas() {
        if (view.displayedImage == null) {
            return; // No calculation if no image is displayed currently
        } else if (autoFitSize) {
            scaleCanvasToContain();
        }

        view.autoFitSize = autoFitSize;
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

    function zoomCanvas(event) {
        const scrollAmount = event.deltaY / 90;
        const inverse = -1;
        applyZoom(inverse * scrollAmount * zoomDelta);
    }

    function applyZoom(amount) {
        autoFitSize = false;
        currentCanvasScale += amount;

        if (currentCanvasScale < 0) {
            currentCanvasScale = 0
        }

        scaleCanvas();
    }

    function mouseWheel(event) {
        if (ctrlKeyDown) {
            zoomCanvas(event);
            event.preventDefault();
        }
    }

    function keyDown(event) {
        if (event.keyCode === 17) {
            ctrlKeyDown = true;
        }
    }
    
    function keyUp(event) {
        if (event.keyCode === 17) {
            ctrlKeyDown = false;
        }
    }

    function scanFiles(files) {
        let supportedFiles = files.filter(util.isImage);

        // If only one file is given, add everything else in the same dir as well.
        if (supportedFiles.length === 1) {
            const otherFiles = util.getAllFilesInSameDir(supportedFiles[0]);
            supportedFiles = supportedFiles.concat(otherFiles.filter(util.isImage));
        }

        const fileNames = supportedFiles.map(v => util.getFileName(v));
        const fileURLs  = supportedFiles.map(util.getAbsolutePath).map(util.handleSlashes).map(util.encodeChars);

        return {
            names: fileNames,
            urls: fileURLs
        };
    }
    
    function switchImage(newIndex) {
        if (fileIndexInRange(newIndex)) {
            currentImageIndex = newIndex;
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
        ctrlKeyDown = false,
        autoFitSize = true,
        zoomDelta = .01,
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
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    view.addWheelHandler(mouseWheel);

    const channelListeners = {
        switchToNextImage() {
            switchImage(currentImageIndex + 1);
        },

        switchToPrevImage() {
            switchImage(currentImageIndex - 1);
        },

        copyImgToClipboard() {
            util.writeImgToClipboard(images[currentImageIndex]);
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
            applyZoom(zoomDelta);
        },
        
        zoomOut() {
            applyZoom(-zoomDelta);
        }
    };

    Object.keys(channelListeners).forEach(key => {
        util.ipcRenderer.on(key, channelListeners[key]);
    });
});