window.addEventListener('util-ready', evt => {
    const util = evt.detail.util;

    const view = (function() {
        const imgContainer = document.getElementById("image-container");
        const canvCheckmark = util.applicationMenu.items[1].submenu.items[2];
        const npImgMenuItems = util.applicationMenu.items[0].submenu.items;

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

                /* Add the new image to the DOM. */
                if (newImageElement && newImageElement instanceof Node) {
                    imgContainer.appendChild(newImageElement);
                }
            },

            get displayedImage() {
                return imgContainer.firstChild;
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