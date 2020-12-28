window.addEventListener('util-ready', event => {
    const util = event.detail.util;

    const view = (function() {
        const imgContainer = document.getElementById('image-container');
        const canvCheckmark = util.applicationMenu.items[1].submenu.items[3];
        const npImgMenuItems = util.applicationMenu.items[0].submenu.items;
        const fitSizeMenuItem = util.applicationMenu.items[1].submenu.items[1].submenu.items[0];

        return /* public interface. */ {
            get imageContainerBoundingRect() {
                return imgContainer.getBoundingClientRect();
            },

            set useCanvas(useCanvasEnabled) {
                canvCheckmark.checked = useCanvasEnabled;
            },

            set displayedImage(newImageElement) {
                /* CLear the container. */
                while (imgContainer.hasChildNodes()) {
                    imgContainer.removeChild(imgContainer.lastChild);
                }

                /* Add the new image to the DOM if possible. */
                if (newImageElement instanceof Node) {
                    imgContainer.appendChild(newImageElement);
                }
            },

            get displayedImage() {
                return imgContainer.firstChild;
            },

            set autoFitSize(enabled) {
                const classname = "scroll";
                if (enabled) {
                    imgContainer.classList.remove(classname);
                } else {
                    imgContainer.classList.add(classname);
                }

                fitSizeMenuItem.checked = enabled;
            },

            addWheelHandler(fn) {
                imgContainer.addEventListener('wheel', fn);
            },

            updateNextPrevMenuItems(prev, next) {
                npImgMenuItems[0].enabled = next;
                npImgMenuItems[1].enabled = prev;
            }
        };
    })();
    
    const viewReadyEvent = new CustomEvent('view-ready', {detail: {
        util: util,
        view: view
    }});

    window.dispatchEvent(viewReadyEvent);
});