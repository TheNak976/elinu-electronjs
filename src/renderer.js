
//lang stuff
if(document.getElementsByClassName('langSelected')){
  for(let el of document.getElementsByClassName('langSelected')) {
    el.addEventListener('click', selectLanguage);
  }
}
function selectLanguage(event) {
  ipcRenderer.send('langSelected', this.dataset.elinulang);
}

document.getElementById("minimizeBtn").addEventListener("click", (e) => {
  ipcRenderer.send('window-minimize');
});

document.getElementById("closeBtn").addEventListener("click", (e) => {
  ipcRenderer.removeAllListeners();
  ipcRenderer.send('window-close');
});
