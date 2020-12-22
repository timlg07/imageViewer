window.addEventListener('util-ready', evt => {
    const fullScreenFlag = "fullscreen";
    const util = evt.detail.util;

    util.ipcRenderer.on('enter-full-screen', () => {
        document.body.classList.add(fullScreenFlag);
    });

    util.ipcRenderer.on('leave-full-screen', () => {
        document.body.classList.remove(fullScreenFlag);
    });
});