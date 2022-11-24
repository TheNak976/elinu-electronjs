const {ipcMain, dialog, BrowserWindow, app} = require('electron');
const fs = require('fs');
const path = require('path');
const formatBytes = require('pretty-byte');
const {DownloadWorker, utils} = require("rapid-downloader");
const axios = require('axios');
const global = require('./global');
const {remoteJsonVersion} = require("./global");
const { spawn } = require('child_process');
const langStrings = require('../langStrings.json');


let worker;
let url ;
let fileName;
let gamePath = global.launcherConfig.gamePath;
let remoteVersionString;


async function downloadProcess(currentWindow) {
    
    try {
        let getRemoteVersion = Promise.all([remoteJsonVersion]);

        remoteVersionString = await getRemoteVersion;
        url = remoteVersionString[0].url_launcher;
        fileName = path.posix.basename(url)
    }catch (e) {
        const options = {
            type: 'error',
            message: "Cannot access to remote server",
            buttons: ['OK'],
            title: 'Remote Server Error(1)',
        };
        dialog.showMessageBox(BrowserWindow.getAllWindows()[0], options).then((res) => {
            //when button "OK" clicked
            if(res.response === 0){
                app.quit();
            }
        });
    }

    
    let pathFileName = path.join(process.cwd() + `/files/${fileName}`);

    worker = new DownloadWorker(url, pathFileName, {
        maxConnections: 10,
        forceMultipleConnections : false,
    });
    worker.on('ready', () => {

        worker.on('start', () => console.log('started'))

        worker.on('progress', (progress) => {
            let currentDl = formatBytes(progress.downloadedBytes) === "NaN undefined" ? 0 : formatBytes(progress.downloadedBytes);
            let dlPercentage = (Math.trunc(progress.completedPercent * 100) / 100).toFixed(2);
            let totalSize = formatBytes(progress.totalBytes);

            updateStatus("UI_TEXT_SPLASH_ON_LAUNCHER_UPDATE", currentWindow, dlPercentage, currentDl, totalSize);

        });

        worker.on('finishing', () => {
            console.log('[ElinuLauncher]-> Download is finishing');
            currentWindow.webContents.send("downloadCompleted")
        });

        worker.on('end', () => {
            console.log('[ElinuLauncher]-> Download is done');
            currentWindow.webContents.send("downloadDone");
            
            //start the extraction
            startProcess(pathFileName, process.cwd(), "Tera-Elinu.exe", remoteVersionString[0].version_launcher);
            console.log('[ElinuLauncher]-> Start extraction...');
            
            setTimeout(async function () {//wait 1sec before quit app
                currentWindow.webContents.send("extractingApp");
                ipcMain.removeAllListeners();
                //BrowserWindow.getFocusedWindow().close();
                app.quit();
            }, 500);

        });

        worker.start();
    });
}

/**
 * Launch the console app to extract the downloaded files
 * @param archivePath
 * @param targetDir
 * @param launcherPath
 * @param launcherNewVersion
 */
function startProcess(archivePath, targetDir, launcherPath, launcherNewVersion) {
    let child = spawn('start "EL Updater"', ['ElinuUpdater.exe', archivePath, targetDir, launcherPath, launcherNewVersion], { detached: true, shell: true });
    child.unref();
}
function updateStatus(stringId, win, dlPercentage, currentDl, totalSize) {
    let updateStr = langStrings[global.launcherConfig.lang][stringId]
        .replace('${dlPercentage}', dlPercentage)
        .replace('${currentDl}', currentDl)
        .replace('${totalSize}', totalSize);
    win.webContents.send("updateDownloadProgress", updateStr);
}
module.exports = {downloadProcess};