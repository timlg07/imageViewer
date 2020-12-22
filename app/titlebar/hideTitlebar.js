window.addEventListener('util-ready', event => {
    const fullScreenFlag = "fullscreen";
    const util = event.detail.util;

    util.ipcRenderer.on('enter-full-screen', () => {
        document.body.classList.add(fullScreenFlag);
    });

    util.ipcRenderer.on('leave-full-screen', () => {
        document.body.classList.remove(fullScreenFlag);
    });
});