const {ipcMain, dialog, globalShortcut} = require('electron');
const fs = require('fs');
const path = require('path');
const formatBytes = require('pretty-byte');
const {DownloadWorker, utils} = require("rapid-downloader");
const axios = require('axios');
const DecompressZip = require('decompress-zip');



let worker;
let url ;
let fileName;

async function checkRemoteUpdate() {
    try {
        let response = await axios.get("https://teraelinu.surge.sh/" + 'version.json');
        let remoteVersion = response.data;
        url = remoteVersion.url;
        fileName = path.posix.basename(url)
    } catch (e) {
        console.error(e);
    }
}
checkRemoteUpdate();
let pathFileName = path.join(process.cwd() + `/files/${fileName}`);
function downloadProcess(currentWindow) {

    worker = new DownloadWorker(url, pathFileName, {
        maxConnections: 10,
        forceMultipleConnections : false,
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

        worker.on('end', () => {
            console.log('Download is done');
            extractUpdatesFiles(currentWindow);
        });

        worker.start();
    });
}

const extractUpdatesFiles = async (win) => {
    
    let unZipper = new DecompressZip(pathFileName)
    
    unZipper.on('progress', function (fileIndex, fileCount) {

        let currentFiles = fileIndex + 1;
        
        console.log('Extracted file ' + (currentFiles) + ' of ' + fileCount);

        win.webContents.send("extractingStart", currentFiles, fileCount)
    });
    
    unZipper.on('error', function (err) {
        console.log('Caught an error');
    });

    unZipper.on('extract', function (log) {
        console.log('Finished extracting');
        win.webContents.send("extractingDone")
        try {
            fs.unlinkSync(pathFileName);
            //file removed
        } catch(err) {
            console.error(err)
        }
    });
    unZipper.extract({
        path: path.join(process.cwd() + `/files/`)//destination
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