const fullScreenFlag = "fullscreen";

ipcRenderer.on('enter-full-screen', () => {
    document.body.classList.add(fullScreenFlag);
});

ipcRenderer.on('leave-full-screen', () => {
    document.body.classList.remove(fullScreenFlag);
});