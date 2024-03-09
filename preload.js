const { contextBridge, ipcRenderer } = require('electron')

window.myAPI = {
    desktop: true
}

contextBridge.exposeInMainWorld('mainAPI', {
    test: () => ipcRenderer.invoke('test'),
})
