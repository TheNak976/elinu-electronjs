const {ipcMain, dialog, globalShortcut} = require('electron');
const fs = require('fs');
const path = require('path');
const formatBytes = require('pretty-byte');
const {DownloadWorker, utils} = require("rapid-downloader");

let worker;

function downloadProcess(currentWindow, url, fileName) {
    worker = new DownloadWorker(url, path.join(process.cwd() + `/files/${fileName}`), {
        maxConnections: 10,
        forceMultipleConnections : true,
    });
    worker.on('ready', () => {

        worker.on('start', () => console.log('started'))

        worker.on('progress', (progress) => {
            let timeRemaining = (progress.bytesPerSecond <= 0 ? "infinite" : secondsToTime((progress.totalBytes - progress.downloadedBytes) / progress.bytesPerSecond));
            let currentDl = formatBytes(progress.downloadedBytes) === "NaN undefined" ? 0 : formatBytes(progress.downloadedBytes);
            let downloadSpeed = utils.dynamicSpeedUnitDisplay(progress.bytesPerSecond, 2);
            let dlPercentage = (Math.trunc(progress.completedPercent * 100) / 100).toFixed(2);
            let totalDownloaded = formatBytes(progress.totalBytes);

            currentWindow.webContents.send("updateDownloadProgress", dlPercentage, currentDl, downloadSpeed, timeRemaining, totalDownloaded, fileName);

        });

        worker.on('finishing', () => {
            console.log('Download is finishing');
            currentWindow.webContents.send("downloadCompleted")
        });

        worker.on('end', () => console.log('Download is done'));

        worker.start();
    });
}
ipcMain.on("pauseDownload",  (event) => {
    worker.pause();
});
//__________________

ipcMain.on("resumeDownload",  (event) => {
    worker.resume();
});
function secondsToTime(s) {
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;

    let str = "";

    if(hrs > 0)
        str += hrs + "h, ";

    if(mins > 0)
        str += mins + "m, ";

    return str + Math.floor(secs) + 's';
}
module.exports = {downloadProcess };