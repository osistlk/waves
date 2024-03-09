const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const os = require('os');

function cpuAverage() {

    //Initialise sum of idle and time of cores and fetch CPU info
    let totalIdle = 0, totalTick = 0;
    let cpus = os.cpus();

    //Loop through CPU cores
    for (let i = 0, len = cpus.length; i < len; i++) {

        //Select CPU core
        let cpu = cpus[i];

        //Total up the time in the cores tick
        for (type in cpu.times) {
            totalTick += cpu.times[type];
        }

        //Total up the idle time of the core
        totalIdle += cpu.times.idle;
    }

    //Return the average Idle and Tick times
    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

let startMeasure = cpuAverage();

//Set delay for second Measure
setTimeout(function () {

    let endMeasure = cpuAverage();

    //Calculate the difference in idle and total time between the measures
    let idleDifference = endMeasure.idle - startMeasure.idle;
    let totalDifference = endMeasure.total - startMeasure.total;

    //Calculate the average percentage CPU usage
    let percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

    return percentageCPU;
}, 1000);

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    ipcMain.handle('cpu-usage', async (event) => {
        // return CPU usage as an average of all cores on the system at the time of invocation
        return startMeasure.total;
    })
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
