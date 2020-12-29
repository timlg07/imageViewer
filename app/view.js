window.addEventListener('util-ready', event => {
    const util = event.detail.util;

    const view = (function() {
        const imgContainer = document.getElementById('image-container');
        const menuItemIds = ['next', 'prev', 'canvas', 'fitSize'];
        const menuItems = {};

        menuItemIds.forEach(id => {
            menuItems[id] = util.applicationMenu.getMenuItemById(id)
        });

        return /* public interface. */ {
            get imageContainerBoundingRect() {
                return imgContainer.getBoundingClientRect();
            },

            set useCanvas(useCanvasEnabled) {
                menuItems.canvas.checked = useCanvasEnabled;
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

                menuItems.fitSize.checked = enabled;
            },

            addWheelHandler(fn) {
                imgContainer.addEventListener('wheel', fn);
            },

            updateNextPrevMenuItems(prev, next) {
                menuItems.next.enabled = next;
                menuItems.prev.enabled = prev;
            }
        };
    })();
    
    const viewReadyEvent = new CustomEvent('view-ready', {detail: {
        util: util,
        view: view
    }});

    window.dispatchEvent(viewReadyEvent);
});