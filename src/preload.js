const { contextBridge, ipcRenderer, shell } = require('electron');
const path = require('path');
const langStrings = require('../langStrings.json');

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, ...arg) => ipcRenderer.send(channel, ...arg),
    on: (event, ...data) => ipcRenderer.on(event, ...data),
    removeAllListeners: () => ipcRenderer.removeAllListeners()
});

contextBridge.exposeInMainWorld('shell', {
    openExternal: (url) => shell.openExternal(url)
});

contextBridge.exposeInMainWorld('langStrings', langStrings);