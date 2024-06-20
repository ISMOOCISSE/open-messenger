const { contextBridge, ipcRenderer } = require('electron');
const fetch = require('electron-fetch').default;

contextBridge.exposeInMainWorld('electronApi', {
 
});
