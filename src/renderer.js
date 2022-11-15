


document.getElementById("minimizeBtn").addEventListener("click", (e) => {
  ipcRenderer.send('window-minimize');
});

document.getElementById("closeBtn").addEventListener("click", (e) => {
  ipcRenderer.removeAllListeners();
  ipcRenderer.send('window-close');
});
