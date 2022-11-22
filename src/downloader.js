const {ipcMain, dialog} = require('electron');
const fs = require('fs');
const path = require('path');
const formatBytes = require('pretty-byte');
const {DownloadWorker, utils} = require("rapid-downloader");
const axios = require('axios');
const DecompressZip = require('decompress-zip');
const global = require('./global');
const {remoteJsonVersion} = require("./global");


let worker;
let url ;
let fileName;
let gamePath = global.launcherConfig.gamePath;
let remoteVersionString;


async function checkRemoteVersion() {
    let getRemoteVersion = Promise.all([remoteJsonVersion]);
    try {
        remoteVersionString = await getRemoteVersion;
        url = remoteVersionString[0].url_launcher;
        fileName = path.posix.basename(url)
    } catch (e) {
        console.error(e);
    }
    
}
checkRemoteVersion();

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
            console.log('[ElinuLauncher]-> Download is finishing');
            currentWindow.webContents.send("downloadCompleted")
        });

        worker.on('end', () => {
            console.log('[ElinuLauncher]-> Download is done');
            extractUpdatesFiles(currentWindow);
        });

        worker.start();
    });
}

const extractUpdatesFiles = async (win) => {
    
    let unZipper = new DecompressZip(pathFileName)
    
    unZipper.on('progress', function (fileIndex, fileCount) {

        let currentFiles = fileIndex + 1;
        
        console.log('[ElinuLauncher]-> Extracted file ' + (currentFiles) + ' of ' + fileCount);

        win.webContents.send("extractingStart", currentFiles, fileCount)
    });
    
    unZipper.on('error', function (err) {
        console.log('[ElinuLauncher]-> Caught an error', err);
    });

    unZipper.on('extract', function (log) {
        console.log('[ElinuLauncher]-> Extracting done');
        win.webContents.send("extractingDone")
        try {
            fs.unlinkSync(pathFileName);
            //file removed
        } catch(err) {
            console.error(err)
        }
    });
    unZipper.extract({
        path: path.join(gamePath)//destination
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
module.exports = {downloadProcess};