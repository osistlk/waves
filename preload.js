const { contextBridge, ipcRenderer } = require('electron')

window.myAPI = {
    desktop: true
}

contextBridge.exposeInMainWorld('systemStats', {
    getUsage: () => ipcRenderer.invoke('cpu-usage'),
    getMemory: () => ipcRenderer.invoke('memory-usage'),
    getDisk: () => ipcRenderer.invoke('disk-usage'),
    getNetwork: () => ipcRenderer.invoke('network-usage'),
    getBattery: () => ipcRenderer.invoke('battery-usage'),
    getTemperature: () => ipcRenderer.invoke('temperature-usage'),
    getGPU: () => ipcRenderer.invoke('gpu-usage'),
    getProcesses: () => ipcRenderer.invoke('processes-usage'),
    getFileSystem: () => ipcRenderer.invoke('file-system-usage'),
    getOS: () => ipcRenderer.invoke('os-usage'),
    getSystem: () => ipcRenderer.invoke('system-usage'),
    getDisplay: () => ipcRenderer.invoke('display-usage'),
    getSound: () => ipcRenderer.invoke('sound-usage'),
    getUSB: () => ipcRenderer.invoke('usb-usage'),
})
